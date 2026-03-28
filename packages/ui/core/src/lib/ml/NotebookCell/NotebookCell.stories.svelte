<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NotebookCell from "./NotebookCell.svelte";

  const { Story } = defineMeta({
    title: "ML/NotebookCell",
    component: NotebookCell,
    tags: ["autodocs"],
  });

  const pythonCode = `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
print(f"Accuracy: {model.score(X_test, y_test):.4f}")`;

  const pythonOutput = `Accuracy: 0.9847`;

  const errorCode = `import pandas as pd

df = pd.read_csv("missing_file.csv")
print(df.head())`;

  const errorOutput = `Traceback (most recent call last):
  File "<stdin>", line 3, in <module>
  File "/usr/lib/python3/pandas/io/parsers.py", line 678, in read_csv
    return _read(filepath, kwds)
FileNotFoundError: [Errno 2] No such file or directory: 'missing_file.csv'`;

  const runningCode = `# Training deep learning model
model.fit(
    train_dataset,
    epochs=50,
    validation_data=val_dataset,
    callbacks=[early_stopping]
)`;
</script>

<Story name="Default" args={{
  code: pythonCode,
  output: pythonOutput,
  outputType: "text",
  status: "success",
  cellNumber: 1,
  language: "python",
}} />

<Story name="Error" args={{
  code: errorCode,
  output: errorOutput,
  outputType: "error",
  status: "error",
  cellNumber: 2,
  language: "python",
}} />

<Story name="Running" args={{
  code: runningCode,
  output: "",
  status: "running",
  cellNumber: 3,
  language: "python",
}} />
