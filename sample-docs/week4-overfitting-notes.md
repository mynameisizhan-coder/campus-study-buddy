# Week 4 Lecture Notes: Overfitting, Regularization, and Cross-Validation

## Overfitting
A model overfits when it learns the noise in the training data instead of the real pattern.
Signs of overfitting: very low training error but high validation/test error.
Underfitting is the opposite: the model is too simple, so both training and test error are high.

The bias–variance trade-off:
- High bias -> underfitting (model too simple)
- High variance -> overfitting (model too sensitive to the training data)

## Regularization
Regularization adds a penalty for large weights to the loss function, which discourages overly complex models.

- L2 regularization (Ridge): adds lambda * sum(w^2). It shrinks all weights toward zero but rarely makes them exactly zero.
- L1 regularization (Lasso): adds lambda * sum(|w|). It can push some weights to exactly zero, so it also performs feature selection.
- The hyperparameter lambda controls the strength: larger lambda = simpler model.

## Cross-validation
k-fold cross-validation splits the training data into k equal parts (folds).
The model is trained k times, each time using k-1 folds for training and 1 fold for validation,
and the k validation scores are averaged. A common choice is k = 5 or k = 10.
Cross-validation is used to choose hyperparameters such as lambda without touching the test set.

## Key takeaway
Never tune your model on the test set. Use a validation set or cross-validation, and only
evaluate on the test set once at the very end.
