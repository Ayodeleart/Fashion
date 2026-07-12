// NOT IMPLEMENTED. This file exists purely as documentation of the swap-in
// point described in docs/measurement-engine-architecture.md §12.
//
// A future ML-based circumference estimator would implement the
// CircumferenceEstimator interface from ../engine/interfaces.ts:
//
//   export class MLCircumferenceEstimator implements CircumferenceEstimator {
//     estimate(input: CircumferenceInput): CircumferenceOutput {
//       // run a trained model (on-device via TensorFlow.js, or a server
//       // API call) against `input`, return the same shape the
//       // heuristic estimator returns today.
//     }
//   }
//
// and be swapped in by changing one line in engine/estimator.ts:
//
//   const circumferenceEstimator: CircumferenceEstimator = new MLCircumferenceEstimator();
//
// Nothing else changes — not MeasurementsFlow.tsx, not the DB schema,
// not the public estimateMeasurementsFromCaptures() signature.
//
// The actual blocker for building this isn't code — it's data. A
// regression model needs real photo + tape-measure-verified pairs to
// train on. That doesn't exist yet. Once real orders come back with
// verified measurements, accumulating that dataset is the real
// prerequisite, not any architectural change here.

export {};
