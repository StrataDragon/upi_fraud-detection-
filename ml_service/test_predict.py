from main import TransactionFeatures, predict_fraud

sample = TransactionFeatures(
    amount=10000.0,
    hourOfDay=2,
    dayOfWeek=2,
    isWeekend=False,
    isNightTime=True,
    senderTxCount7d=10,
    senderTxCount1h=6,
    senderAvgAmount=1000.0,
    amountZScore=4.0,
    isNewReceiver=True,
    receiverIsBlacklisted=False,
    descriptionRiskScore=0.8,
    isRoundAmount=False,
    amountToAvgRatio=10.0
)

res = predict_fraud(sample)
print(res)
