/**
 * @module ngw-mapbox
 */

import 'mapbox-gl/dist/mapbox-gl.css';

import NgwMap, { NgwLayerOptions, NgwMapOptions, LayerAdapter } from '@nextgis/ngw-map';
import MapboxglMapAdapter from '@nextgis/mapboxgl-map-adapter';
import { ResourceAdapter } from '@nextgis/ngw-kit';

export class NgwMapbox extends NgwMap {

  constructor(options: NgwMapOptions) {
    super(new MapboxglMapAdapter(), options);
  }

  addNgwLayer(options: NgwLayerOptions): Promise<ResourceAdapter | undefined> {
    // TODO: still no way to add NGW IMAGE to mapbox-gl
    // always use tile adapter
    if (options.adapter === 'IMAGE') {
      options.adapter = 'TILE';
    }
    return super.addNgwLayer(options);
  }
}

export default NgwMapbox;

// @ts-ignore
if (window && !window.NgwMap) { window.NgwMap = NgwMapbox; }
