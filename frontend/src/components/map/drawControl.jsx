import { useEffect, useRef } from 'react';
import { useControl } from 'react-map-gl/maplibre';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

/**
 * Wraps MapboxDraw as a react-map-gl control.
 * Uses a ref for props to ensure event handlers always use the latest callbacks.
 */
export default function DrawControl(props) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const draw = useControl(
    () => new MapboxDraw(props),
    ({ map }) => {
      const onCreate = (e) => propsRef.current.onCreate?.(e);
      const onUpdate = (e) => propsRef.current.onUpdate?.(e);
      const onDelete = (e) => propsRef.current.onDelete?.(e);
      const onSel    = (e) => propsRef.current.onSelectionChange?.(e);

      map.on('draw.create',          onCreate);
      map.on('draw.update',          onUpdate);
      map.on('draw.delete',          onDelete);
      map.on('draw.selectionchange', onSel);

      // Store cleanup function
      map._drawCleanup = () => {
        map.off('draw.create',          onCreate);
        map.off('draw.update',          onUpdate);
        map.off('draw.delete',          onDelete);
        map.off('draw.selectionchange', onSel);
      };
    },
    ({ map }) => {
      if (map._drawCleanup) {
        map._drawCleanup();
        delete map._drawCleanup;
      }
    },
    { position: props.position || 'top-left' },
  );

  useEffect(() => {
    if (draw && props.setDrawInstance) {
      props.setDrawInstance(draw);
    }
  }, [draw]);

  return null;
}