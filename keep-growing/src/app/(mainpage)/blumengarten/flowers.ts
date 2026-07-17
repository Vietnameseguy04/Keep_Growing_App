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

// Die IDs sind in der Datenbank (flower_garden.flower_type) gespeichert
// und dürfen nicht verändert werden – nur Titel und Bilder.
export const flowerOptions: FlowerOption[] = [
  {
    id: "creativityWarmth",
    title: "Schwere & Wärme",
    image: "/images/wildblume-1.svg",
  },
  {
    id: "imaginativeTraining",
    title: "Fantasiereise",
    image: "/images/wildblume-2.svg",
  },
  {
    id: "innerPeace",
    title: "Innere Ruhe",
    image: "/images/wildblume-3.svg",
  },
  {
    id: "selfEmpowerment",
    title: "Selbststärkung",
    image: "/images/wildblume-4.svg",
  },
];

export const flowerImageById: Record<string, string> = Object.fromEntries(
  flowerOptions.map((flower) => [flower.id, flower.image]),
);

export const flowerTitleById: Record<string, string> = Object.fromEntries(
  flowerOptions.map((flower) => [flower.id, flower.title]),
);
