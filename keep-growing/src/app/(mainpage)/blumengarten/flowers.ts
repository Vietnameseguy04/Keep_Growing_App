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

export const flowerOptions: FlowerOption[] = [
  {
    id: "creativityWarmth",
    title: "Creativity & warmth",
    image: "/images/flower-1.png",
  },
  {
    id: "imaginativeTraining",
    title: "Imaginative training",
    image: "/images/flower-2.png",
  },
  {
    id: "innerPeace",
    title: "Inner peace",
    image: "/images/flower-3.png",
  },
  {
    id: "selfEmpowerment",
    title: "Self-empowerment",
    image: "/images/flower-4.png",
  },
];

export const flowerImageById: Record<string, string> = Object.fromEntries(
  flowerOptions.map((flower) => [flower.id, flower.image]),
);

export const flowerTitleById: Record<string, string> = Object.fromEntries(
  flowerOptions.map((flower) => [flower.id, flower.title]),
);
