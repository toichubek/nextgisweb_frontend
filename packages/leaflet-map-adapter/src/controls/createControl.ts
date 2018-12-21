import { MapControl } from '@nextgis/webmap';
import { Control } from 'leaflet';

export function createControl(control: MapControl): Control  {
  const C = Control.extend({
    onAdd () {
      return control.onAdd();
    },
    onRemove () {
      control.onRemove();
    }
  });
  return new C();
}