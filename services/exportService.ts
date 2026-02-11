
import pptxgen from "pptxgenjs";
import { Presentation, Theme } from "../types";

export const exportToPPTX = async (presentation: Presentation) => {
  const pres = new pptxgen();

  // Set Metadata
  pres.title = presentation.title;
  pres.subject = "Federal Presentation";
  pres.author = "Presenton K8s Edition";
  pres.company = "Schweizerische Eidgenossenschaft";

  // Define Colors based on Theme
  const themeColors = {
    [Theme.LIGHT]: { bg: "FFFFFF", text: "0F172A", accent: "DC2626" },
    [Theme.DARK]: { bg: "0F172A", text: "FFFFFF", accent: "DC2626" },
    [Theme.ROYAL]: { bg: "1E1B4B", text: "FFFFFF", accent: "6366F1" },
    [Theme.SOFT]: { bg: "ECFDF5", text: "064E3B", accent: "10B981" }
  };

  const colors = themeColors[presentation.theme];

  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { fill: colors.bg };
  
  titleSlide.addText(presentation.title, {
    x: 1, y: 2, w: "80%", h: 1.5,
    fontSize: 44, bold: true, color: colors.text,
    align: "center", fontFace: "Inter"
  });

  titleSlide.addText("Erstellt mit Presenton Federal Edition", {
    x: 1, y: 4, w: "80%", h: 0.5,
    fontSize: 14, color: colors.text, opacity: 0.6,
    align: "center"
  });

  // Footer / Branding
  pres.defineSlideMaster({
    title: "FEDERAL_MASTER",
    background: { fill: colors.bg },
    objects: [
      { rect: { x: 0, y: "95%", w: "100%", h: "5%", fill: { color: colors.bg } } },
      { text: { 
          text: `© ${new Date().getFullYear()} Schweizerische Eidgenossenschaft | ${presentation.title}`, 
          options: { x: 0.5, y: "95%", w: "90%", h: 0.3, fontSize: 10, color: colors.text, opacity: 0.4 } 
        } 
      }
    ]
  });

  // Content Slides
  for (const slide of presentation.slides) {
    const s = pres.addSlide({ masterName: "FEDERAL_MASTER" });
    
    // Slide Title
    s.addText(slide.title, {
      x: 0.5, y: 0.5, w: "90%", h: 0.8,
      fontSize: 28, bold: true, color: colors.text,
      fontFace: "Inter"
    });

    // Content (Left side)
    const bulletPoints = slide.content.map(point => ({ text: point, options: { bullet: true, indentLevel: 0 } }));
    s.addText(bulletPoints, {
      x: 0.5, y: 1.5, w: "45%", h: 5,
      fontSize: 18, color: colors.text,
      fontFace: "Inter", align: "left", valign: "top"
    });

    // Image (Right side)
    if (slide.imageUrl) {
      try {
        // pptxgenjs handles data URIs directly
        s.addImage({
          data: slide.imageUrl,
          x: "52%", y: 1.5, w: "43%", h: 5,
          sizing: { type: "cover", w: 4, h: 5 }
        });
      } catch (err) {
        console.error("Failed to add image to PPTX", err);
      }
    }
  }

  // Save the presentation
  const fileName = presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".pptx";
  await pres.writeFile({ fileName });
};
