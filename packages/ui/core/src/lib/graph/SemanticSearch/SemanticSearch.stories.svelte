<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SemanticSearch from "./SemanticSearch.svelte";

  const { Story } = defineMeta({
    title: "Graph/SemanticSearch",
    component: SemanticSearch,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="max-width: 640px;">
    <SemanticSearch
      query="transformer attention mechanisms"
      results={[
        {
          id: "1",
          title: "Self-Attention in Transformer Networks",
          snippet: "The self-attention mechanism allows the model to weigh the importance of different positions in the input sequence when computing representations.",
          score: 0.95,
          tags: ["NLP", "Transformers", "Attention"],
          source: "arxiv:1706.03762",
        },
        {
          id: "2",
          title: "Multi-Head Attention Explained",
          snippet: "Multi-head attention projects queries, keys, and values multiple times with different learned linear projections, enabling the model to attend to information from different representation subspaces.",
          score: 0.87,
          tags: ["Deep Learning", "Architecture"],
          source: "ml-glossary.org",
        },
        {
          id: "3",
          title: "Efficient Attention Variants",
          snippet: "Recent work has proposed linear attention mechanisms that reduce the quadratic complexity of standard attention to linear, enabling processing of longer sequences.",
          score: 0.72,
          tags: ["Efficiency", "Long-context"],
          source: "papers-with-code.com",
        },
        {
          id: "4",
          title: "Cross-Attention for Multimodal Models",
          snippet: "Cross-attention enables interaction between different modalities by using one modality as queries and another as keys and values.",
          score: 0.61,
          tags: ["Multimodal", "Vision-Language"],
        },
      ]}
      onresultclick={(id) => console.log("Clicked:", id)}
    />
  </div>
</Story>

<Story name="Loading">
  <div style="max-width: 640px;">
    <SemanticSearch
      query="neural network optimization"
      loading={true}
    />
  </div>
</Story>

<Story name="Empty">
  <div style="max-width: 640px;">
    <SemanticSearch
      query="zzxxyy nonexistent topic"
      results={[]}
    />
  </div>
</Story>

<Story name="HighScores">
  <div style="max-width: 640px;">
    <SemanticSearch
      query="backpropagation gradient descent"
      results={[
        {
          id: "1",
          title: "Backpropagation Algorithm",
          snippet: "The backpropagation algorithm computes the gradient of the loss function with respect to network weights by applying the chain rule.",
          score: 0.99,
          tags: ["Fundamentals", "Training"],
          source: "deep-learning-book.org",
        },
        {
          id: "2",
          title: "Stochastic Gradient Descent and Variants",
          snippet: "SGD and its variants (Adam, RMSprop, AdaGrad) are the workhorses of deep learning optimization, each with different convergence properties.",
          score: 0.96,
          tags: ["Optimization", "SGD"],
          source: "arxiv:1609.04747",
        },
        {
          id: "3",
          title: "Vanishing and Exploding Gradients",
          snippet: "Deep networks suffer from vanishing or exploding gradients during backpropagation, motivating architectural innovations like residual connections.",
          score: 0.93,
          tags: ["Training", "Stability"],
          source: "distill.pub",
        },
      ]}
      onresultclick={(id) => console.log("Clicked:", id)}
    />
  </div>
</Story>
