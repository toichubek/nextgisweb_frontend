/**
 * @module ol-map-adapter
 */

import {
  MapAdapter,
  ControlPositions,
  MapOptions,
  MapControl,
  CreateControlOptions,
  ButtonControlOptions,
  LayerAdapter,
  LngLatArray,
  LngLatBoundsArray,
} from '@nextgis/webmap';
import Map from 'ol/Map';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';

import { ImageAdapter } from './layer-adapters/ImageAdapter';
import { EventEmitter } from 'events';
import { OsmAdapter } from './layer-adapters/OsmAdapter';
import { MarkerAdapter } from './layer-adapters/MarkerAdapter';
import { TileAdapter } from './layer-adapters/TileAdapter';
import { GeoJsonAdapter } from './layer-adapters/GeoJsonAdapter';

// @ts-ignore
import { fromLonLat, transformExtent, transform } from 'ol/proj';
import { Attribution } from './controls/Attribution';
import { olx } from 'openlayers';
import { PanelControl } from './controls/PanelControl';
import { createControl } from './controls/createControl';
import { createButtonControl } from './controls/createButtonControl';

type Layer = ol.layer.Base;
type Control = ol.control.Control;

type TLayerAdapter = LayerAdapter<Map, Layer>;

interface PositionMem {
  center: LngLatArray | undefined;
  zoom: number | undefined;
}

export type ForEachFeatureAtPixelCallback = (
  feature: ol.Feature,
  layer: ol.layer.Layer,
  evt: ol.MapBrowserPointerEvent) => void;
export class OlMapAdapter implements MapAdapter<Map, Layer> {

  static layerAdapters = {
    IMAGE: ImageAdapter,
    TILE: TileAdapter,
    // MVT: MvtAdapter,
    OSM: OsmAdapter,
    MARKER: MarkerAdapter,
    GEOJSON: GeoJsonAdapter,
  };

  static controlAdapters = {
    ZOOM: Zoom,
    ATTRIBUTION: Attribution,
  };

  options: any;

  layerAdapters = OlMapAdapter.layerAdapters;
  controlAdapters = OlMapAdapter.controlAdapters;

  emitter = new EventEmitter();

  map?: Map;

  private displayProjection = 'EPSG:3857';
  private lonlatProjection = 'EPSG:4326';

  private _mapClickEvents: Array<(evt: ol.MapBrowserPointerEvent) => void> = [];
  private _forEachFeatureAtPixel: ForEachFeatureAtPixelCallback[] = [];
  private _olView?: View;
  private _panelControl?: PanelControl;

  private _positionMem: { [key in 'movestart' | 'moveend']?: PositionMem } = {};

  create(options: MapOptions) {
    this.options = { ...options };
    const view = new View({
      center: options.center,
      zoom: options.zoom,
      projection: this.displayProjection,
    });

    const defOpt: olx.MapOptions = {
      logo: false,
      controls: [],
      view,
      layers: [],
    };
    const mapInitOptions: olx.MapOptions = {
      ...defOpt,
      target: options.target,
      // logo: options.logo,
    };

    this.map = new Map(mapInitOptions);

    this._panelControl = new PanelControl();
    this.map.addControl(this._panelControl);

    this.map.set('_mapClickEvents', this._mapClickEvents);
    this.map.set('_forEachFeatureAtPixel', this._forEachFeatureAtPixel);

    this.emitter.emit('create', { map: this.map });
    this._olView = this.map.getView();

    this._addMapListeners();
  }

  getContainer(): HTMLElement | undefined {
    if (this.options.target) {
      let element;
      if (typeof this.options.target === 'string') {
        element = document.getElementById(this.options.target);
      } else if (this.options.target instanceof HTMLElement) {
        element = this.options.target;
      }
      return element;
    }
  }

  setCenter(lonLat: LngLatArray) {
    if (this._olView) {
      this._olView.setCenter(fromLonLat(lonLat));
    }
  }

  getCenter(): LngLatArray | undefined {
    if (this._olView) {
      return this._olView.getCenter();
    }
  }

  setZoom(zoom: number) {
    if (this._olView) {
      this._olView.setZoom(zoom);
    }
  }

  getZoom() {
    if (this._olView) {
      return this._olView.getZoom();
    }
  }

  fit(e: LngLatBoundsArray) {
    if (this._olView) {
      const toExtent = transformExtent(
        e,
        this.lonlatProjection,
        this.displayProjection,
      );
      this._olView.fit(toExtent);
    }
  }

  setRotation(angle: number) {
    if (this._olView) {
      this._olView.setRotation(angle);
    }
  }

  removeLayer(layer: Layer) {
    if (this.map) {
      this.map.removeLayer(layer);
    }
  }

  showLayer(layer: Layer) {
    if (this.map) {
      this.map.addLayer(layer);
    }
  }

  hideLayer(layer: Layer) {
    if (this.map) {
      this.map.removeLayer(layer);
    }
  }

  setLayerOpacity(layer: Layer, value: number) {
    // ignore
  }

  setLayerOrder(layer: Layer, order: number, layers?: { [name: string]: TLayerAdapter }) {
    if (layer.setZIndex) {
      layer.setZIndex(order);
    }
  }

  createControl(control: MapControl, options: CreateControlOptions) {
    return createControl(control, options);
  }

  createButtonControl(options: ButtonControlOptions) {
    return createButtonControl(options);
  }

  addControl(control: Control, position: ControlPositions) {
    if (this._panelControl) {
      this._panelControl.addControl(control, position);
      return control;
    }
  }

  removeControl(control: Control) {
    if (this._panelControl) {
      this._panelControl.removeControl(control);
    }
  }

  onMapClick(evt: ol.MapBrowserPointerEvent) {
    const [lng, lat] = transform(
      evt.coordinate,
      this.displayProjection,
      this.lonlatProjection,
    );
    const latLng = {
      lat, lng,
    };

    this._mapClickEvents.forEach((x) => {
      x(evt);
    });

    if (this._forEachFeatureAtPixel.length) {
      if (this.map) {
        this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          this._forEachFeatureAtPixel.forEach((x) => {
            x(feature as ol.Feature, layer, evt);
          });
        });
      }
    }

    this.emitter.emit('click', {
      latLng,
      pixel: { left: evt.pixel[0], top: evt.pixel[1] },
      source: evt,
    });
  }

  // requestGeomString(pixel: { top: number, left: number }, pixelRadius = 5) {
  //   const { top, left } = pixel;
  //   const olMap = this.map;
  //   if (olMap) {
  //     const bounds = boundingExtent([
  //       olMap.getCoordinateFromPixel([
  //         left - pixelRadius,
  //         top - pixelRadius,
  //       ]),
  //       olMap.getCoordinateFromPixel([
  //         left + pixelRadius,
  //         top + pixelRadius,
  //       ]),
  //     ]);

  //     return new WKT().writeGeometry(
  //       Polygon.fromExtent(bounds)
  //     );
  //   }
  // }

  private _addMapListeners() {
    const map = this.map;
    if (map) {
      map.on('click', (evt) => this.onMapClick(evt as ol.MapBrowserPointerEvent), this);

      const center = this.getCenter();
      const zoom = this.getZoom();

      const events: ['movestart', 'moveend'] = ['movestart', 'moveend'];
      events.forEach((x) => {
        this._positionMem[x] = { center, zoom };
        map.on(x, (evt) => {
          this._emitPositionChangeEvent(x);
        });
      });

      if (this._olView) {
        this._olView.on('change:resolution', (evt) => {
          this.emitter.emit('zoom', this);
        });

        this._olView.on('change:center', (evt) => {
          this.emitter.emit('move', this);
        });
      }

    }
  }

  private _emitPositionChangeEvent(eventName: 'movestart' | 'moveend') {
    const mem = this._positionMem[eventName];
    let memCenter: LngLatArray | undefined;
    let memZoom: number | undefined;
    if (mem) {
      memCenter = mem.center;
      memZoom = mem.zoom;
    }
    const center = this.getCenter();
    const zoom = this.getZoom();
    if (memZoom !== zoom) {
      const zoomEventName = eventName === 'movestart' ? 'zoomstart' : 'zoomend';
      this.emitter.emit(zoomEventName, this);
    }
    if (memCenter && center) {
      const [cLng, cLat] = center;
      const [lng, lat] = memCenter;
      if (cLng !== lng || cLat !== lat) {
        this.emitter.emit(eventName, this);
      }
      // type self query for undefined case
    } else if (memCenter !== center) {
      this.emitter.emit(eventName, this);
    }
    this._positionMem[eventName] = { center, zoom };
  }
}
