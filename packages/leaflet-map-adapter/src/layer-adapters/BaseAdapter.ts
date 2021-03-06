import { BaseLayerAdapter, AdapterOptions } from '@nextgis/webmap';
import { Map } from 'leaflet';

export class BaseAdapter<O extends AdapterOptions = AdapterOptions, L = any> implements BaseLayerAdapter<Map, L, O> {

  layer?: L;
  protected pane: string = 'order-0';

  constructor(public map: L.Map, public options: O) {
    if (options.order !== undefined) {
      const pane = 'order-' + options.order;
      let exist = map.getPane(pane);
      if (!exist) {
        exist = map.createPane(pane);
      }
      exist.style.zIndex = String(options.order);
      this.pane = pane;
    }
   }

  addLayer(options: O): L | Promise<L> | undefined {
    return undefined;
  }
}
