import React from "react";

const ReelSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article className="reel reel-skeleton" key={index} role="listitem">
          <div className="skeleton-video" />

          <div className="skeleton-overlay">
            <div className="skeleton-line skeleton-line-wide" />
            <div className="skeleton-line skeleton-line-short" />
          </div>

          <div className="skeleton-controls">
            <div className="skeleton-circle" />
            <div className="skeleton-circle" />
          </div>
        </article>
      ))}
    </>
  );
};

export default ReelSkeleton;
