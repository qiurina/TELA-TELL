# Fabric classifier model

`fabric_classifier.tflite` here is a placeholder text file, not a real model — it exists
so the app always has something to `require()` and bundle without crashing Metro.

`features/scan/lib/ml/model.ts` tries to load it at runtime; loading a placeholder fails
gracefully and the app falls back to mock scan results (see `create-scan-record.ts`).

Once you've trained a real model (see `../../../ml-training/README.md`), replace this
file with the exported `.tflite` output:

```bash
cp ../../ml-training/models/fabric_classifier.tflite ./fabric_classifier.tflite
cp ../../ml-training/models/fabric_classifier.labels.txt ./fabric_classifier.labels.txt
```

Class order in the labels file must match `SUPPORTED_FABRICS` in
`../../data/fabrics/fabrics.ts`.