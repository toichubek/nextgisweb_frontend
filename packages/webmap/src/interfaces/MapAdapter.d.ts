export interface MapOptions {
    target: string | HTMLElement;
    logo?: string;
    controls?: any[];
    minZoom?: number;
}
export interface MapAdapter {
    lonlatProjection: string;
    displayProjection: string;
    create(options?: any): void;
    addLayer(layerName: string): any;
    removeLayer(layerName: string): any;
    registrateWmsLayer(layerName: string, options: any): any;
    setCenter(latLng: [number, number]): void;
    setZoom(zoom: number): void;
    fit(extent: [number, number, number, number]): void;
    setRotation?(angle: number): void;
}