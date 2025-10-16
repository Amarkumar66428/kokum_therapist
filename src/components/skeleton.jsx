import React from "react";
import { Skeleton, Stack } from "@mui/material";

/**
 * DynamicSkeleton Component
 *
 * @param {number} count - number of skeleton items
 * @param {string} variant - "text" | "rectangular" | "circular"
 * @param {number|string} width - width of each skeleton
 * @param {number|string} height - height of each skeleton
 * @param {string} animation - "pulse" | "wave" | false
 * @param {string} spacing - spacing between skeletons
 */
const SkeletonBlock = ({
  count = 1,
  variant = "text",
  width = "100%",
  height = 40,
  animation = "wave",
  borderRadius = 0,
}) => {
  return Array.from({ length: count }).map((_, i) => (
    <Skeleton
      key={i}
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={{ borderRadius }}
    />
  ));
};

export default SkeletonBlock;
