"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width = "50%", alignment = "center" } = node.attrs;
  const [isResizing, setIsResizing] = React.useState(false);
  const [currentWidth, setCurrentWidth] = React.useState<string>(width);
  const [dragPx, setDragPx] = React.useState<number | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  const handleMouseDown = (direction: "right" | "left") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parent = containerRef.current?.closest(".prose") || containerRef.current?.parentElement;
    const parentWidth = parent ? parent.clientWidth : 800;

    const initialX = e.clientX;
    const initialWidthPx = imgRef.current ? imgRef.current.offsetWidth : parentWidth * 0.5;

    setIsResizing(true);
    setDragPx(initialWidthPx);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - initialX;
      let newWidthPx = initialWidthPx;

      if (direction === "right") {
        newWidthPx = initialWidthPx + deltaX;
      } else {
        newWidthPx = initialWidthPx - deltaX;
      }

      // Constrain between 120px and parentWidth
      const clampedWidthPx = Math.max(120, Math.min(parentWidth, newWidthPx));
      setDragPx(Math.round(clampedWidthPx));

      const percentage = Math.round((clampedWidthPx / parentWidth) * 100);
      setCurrentWidth(`${percentage}%`);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      setIsResizing(false);
      setDragPx(null);

      if (imgRef.current && parentWidth) {
        const finalPx = imgRef.current.offsetWidth;
        const finalPct = `${Math.min(100, Math.max(15, Math.round((finalPx / parentWidth) * 100)))}%`;
        updateAttributes({ width: finalPct });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Alignment wrapper styles
  let wrapperClass = "relative my-4 group/img select-none transition-all";
  let wrapperStyle: React.CSSProperties = {
    maxWidth: "100%",
  };

  if (alignment === "left") {
    wrapperClass += " float-left mr-5 mb-3 clear-left";
    wrapperStyle.width = currentWidth;
  } else if (alignment === "right") {
    wrapperClass += " float-right ml-5 mb-3 clear-right";
    wrapperStyle.width = currentWidth;
  } else if (alignment === "full") {
    wrapperClass += " w-full clear-both block";
    wrapperStyle.width = "100%";
  } else {
    // default center
    wrapperClass += " mx-auto clear-both block";
    wrapperStyle.width = currentWidth;
  }

  const isHighlighted = selected || isResizing;

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={wrapperClass}
      style={wrapperStyle}
      data-alignment={alignment}
      data-width={currentWidth}
    >
      <div className="relative inline-block w-full">
        {/* The Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ""}
          className={`w-full h-auto rounded-lg transition-all duration-150 block object-cover ${
            isHighlighted
              ? "ring-2 ring-primary shadow-lg"
              : "hover:ring-1 hover:ring-primary/40 shadow-xs"
          }`}
          draggable={false}
        />

        {/* Live Size Pill while dragging */}
        {isResizing && dragPx && (
          <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/85 text-white text-[11px] font-mono shadow-md backdrop-blur-xs">
            {dragPx}px ({currentWidth})
          </div>
        )}

        {/* ─── Drag Resize Handles (Visible when image is hovered or selected) ─── */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-150 ${
            isHighlighted ? "opacity-100" : "opacity-0 group-hover/img:opacity-100"
          }`}
        >
          {/* Subtle bounding border */}
          <div className="absolute inset-0 border border-primary/40 rounded-lg pointer-events-none" />

          {/* Left Handle */}
          <div
            onMouseDown={handleMouseDown("left")}
            className="pointer-events-auto absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-2.5 rounded-full bg-background border-2 border-primary shadow-md cursor-ew-resize hover:scale-125 transition-transform"
            title="Drag to resize width"
          />

          {/* Right Handle */}
          <div
            onMouseDown={handleMouseDown("right")}
            className="pointer-events-auto absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 h-8 w-2.5 rounded-full bg-background border-2 border-primary shadow-md cursor-ew-resize hover:scale-125 transition-transform"
            title="Drag to resize width"
          />

          {/* Bottom-Right Corner Handle */}
          <div
            onMouseDown={handleMouseDown("right")}
            className="pointer-events-auto absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-background border-2 border-primary shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
            title="Drag to resize"
          />

          {/* Bottom-Left Corner Handle */}
          <div
            onMouseDown={handleMouseDown("left")}
            className="pointer-events-auto absolute -bottom-1 -left-1 h-3.5 w-3.5 rounded-full bg-background border-2 border-primary shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
            title="Drag to resize"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
