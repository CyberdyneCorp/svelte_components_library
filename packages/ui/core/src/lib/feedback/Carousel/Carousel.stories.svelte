<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Carousel from "./Carousel.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Carousel",
    component: Carousel,
    tags: ["autodocs"],
  });

  const textSlides = [
    {
      title: "Real-time Model Monitoring",
      content: "Track your model performance metrics in real-time with automated drift detection and alerting.",
    },
    {
      title: "One-click Deployments",
      content: "Deploy models to production with a single click. Supports canary releases and A/B testing out of the box.",
    },
    {
      title: "Collaborative Notebooks",
      content: "Work together on Jupyter-style notebooks with version control and real-time collaboration.",
    },
  ];

  const imageSlides = [
    {
      title: "Data Pipeline",
      image: "",
    },
    {
      title: "Model Training",
      image: "",
    },
    {
      title: "Production Deployment",
      image: "",
    },
  ];

  const autoPlaySlides = [
    {
      title: "Step 1: Ingest",
      content: "Connect your data sources and configure ingestion pipelines.",
    },
    {
      title: "Step 2: Transform",
      content: "Apply feature engineering and data transformations.",
    },
    {
      title: "Step 3: Train",
      content: "Train and evaluate models with automated hyperparameter tuning.",
    },
    {
      title: "Step 4: Deploy",
      content: "Deploy the best model to your production environment.",
    },
  ];
</script>

<Story name="Default" args={{
  items: textSlides,
  showDots: true,
  showArrows: true,
  loop: true,
}} />

<Story name="WithImages" args={{
  items: imageSlides,
  showDots: true,
  showArrows: true,
  loop: true,
}} />

<Story name="AutoPlay" args={{
  items: autoPlaySlides,
  autoPlay: true,
  interval: 3000,
  showDots: true,
  showArrows: true,
  loop: true,
}} />
