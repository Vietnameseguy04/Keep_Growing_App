export type FlowerId =
  | "creativityWarmth"
  | "imaginativeTraining"
  | "innerPeace"
  | "selfEmpowerment";

export type FlowerOption = {
  id: FlowerId;
  title: string;
  image: string;
};

// Three interchangeable art styles live in public/images:
//   "pressed"    – realistic pressed flowers WITH stems, extracted from
//                  the garden mockups in the client's design PDF
//                  (flower-pressed-1..4.png)
//   "blossom"    – the client's watercolor blossom heads from the
//                  selection-screen mockup (flower-real-1..4.png)
//   "watercolor" – hand-built SVG wildflowers with stems
//                  (wildblume-1..4.svg)
// Switch styles by changing FLOWER_STYLE – nothing else needs to change.
export type FlowerStyle = "pressed" | "blossom" | "watercolor";

export const FLOWER_STYLE: FlowerStyle = "pressed";

const imagesByStyle: Record<FlowerStyle, Record<FlowerId, string>> = {
  pressed: {
    creativityWarmth: "/images/flower-pressed-1.png",
    imaginativeTraining: "/images/flower-pressed-2.png",
    innerPeace: "/images/flower-pressed-3.png",
    selfEmpowerment: "/images/flower-pressed-4.png",
  },
  blossom: {
    creativityWarmth: "/images/flower-real-1.png",
    imaginativeTraining: "/images/flower-real-2.png",
    innerPeace: "/images/flower-real-3.png",
    selfEmpowerment: "/images/flower-real-4.png",
  },
  watercolor: {
    creativityWarmth: "/images/wildblume-1.svg",
    imaginativeTraining: "/images/wildblume-2.svg",
    innerPeace: "/images/wildblume-3.svg",
    selfEmpowerment: "/images/wildblume-4.svg",
  },
};

// The ids are stored in the database (flower_garden.flower_type) and
// must never change – only titles and images may.
export const flowerOptions: FlowerOption[] = [
  {
    id: "creativityWarmth",
    title: "Gravity & warmth",
    image: imagesByStyle[FLOWER_STYLE].creativityWarmth,
  },
  {
    id: "imaginativeTraining",
    title: "Imaginative training",
    image: imagesByStyle[FLOWER_STYLE].imaginativeTraining,
  },
  {
    id: "innerPeace",
    title: "Inner peace",
    image: imagesByStyle[FLOWER_STYLE].innerPeace,
  },
  {
    id: "selfEmpowerment",
    title: "Self-empowerment",
    image: imagesByStyle[FLOWER_STYLE].selfEmpowerment,
  },
];

export const flowerImageById: Record<string, string> = Object.fromEntries(
  flowerOptions.map((flower) => [flower.id, flower.image]),
);

export const flowerTitleById: Record<string, string> = Object.fromEntries(
  flowerOptions.map((flower) => [flower.id, flower.title]),
);
