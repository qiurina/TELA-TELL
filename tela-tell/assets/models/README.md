# Fabric classifier model

`fabric_classifier.tflite` here is the real trained model (input `[1,224,224,3]` float32,
output `[1,12]` float32 over the 12 classes in `fabric_classifier.labels.txt`), loaded at
runtime by `features/scan/lib/ml/model.ts` via `react-native-fast-tflite`.

There is no mock/placeholder fallback — if the model fails to load or classify, `classifyFabric()`
throws and `create-scan-record.ts` surfaces "Could not analyze this photo. Please try again."
to the user.

Class order in the labels file must match `SUPPORTED_FABRICS` in
`../../data/fabrics/fabrics.ts`.

To replace the model with a newer training run (see `../../../ml-training/README.md`):

```bash
cp ../../ml-training/models/fabric_classifier.tflite ./fabric_classifier.tflite
cp ../../ml-training/models/fabric_classifier.labels.txt ./fabric_classifier.labels.txt
```
