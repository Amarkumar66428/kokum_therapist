import React from "react";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/system";

const BoldText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  display: "inline",
  color: theme.palette.text.primary,
}));

const NormalText = styled(Typography)(({ theme }) => ({
  display: "inline",
  color: theme.palette.text.primary,
  lineHeight: 1.7,
}));

// Extract plain text from various data types
const extractTextContent = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if (typeof value.content === "string") return value.content;
    if (typeof value.text === "string") return value.text;
    if (Array.isArray(value)) return value.map(extractTextContent).join(" ");
    return "";
  }
  return value == null ? "" : String(value);
};

const renderFormattedText = (textLike) => {
  let text = extractTextContent(textLike);
  if (!text) return null;

  // Bold “instant suggestions” inline
  text = text.replace(/(instant suggestions)/gi, "**$1**");

  // Force "Recommendations" onto a new line and bold it
  text = text.replace(/Recommendations/gi, "\n**Recommendations**");

  // Split by **bold**
  const parts = text?.split(/(\*\*.*?\*\*)/g);

  const formattedOutput = parts.flatMap((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <BoldText key={`bold-${index}`} component="span">
          {part.slice(2, -2)}
        </BoldText>
      );
    }

    // Split by [ ... ]
    const subParts = part.split(/(\[.*?\])/g);

    return subParts.flatMap((subPart, subIndex) => {
      if (subPart.startsWith("[") && subPart.endsWith("]")) {
        const items = subPart
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        return (
          <Box
            key={`bracket-block-${index}-${subIndex}`}
            sx={{
              display: "block",
              mt: 1,
              ml: 2,
            }}
          >
            {items.map((item, itemIndex) => (
              <Typography
                key={`bracket-item-${index}-${subIndex}-${itemIndex}`}
                variant="body2"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  lineHeight: 1.6,
                }}
              >
                {itemIndex + 1}. {item}
              </Typography>
            ))}
          </Box>
        );
      }

      return (
        <NormalText
          key={`text-${index}-${subIndex}`}
          variant="body1"
          component="span"
        >
          {subPart}
        </NormalText>
      );
    });
  });

  return (
    <Box sx={{ whiteSpace: "pre-wrap", color: "text.primary", fontSize: 16 }}>
      {formattedOutput}
    </Box>
  );
};

export default renderFormattedText;
