self.onmessage = function onMessage(event) {
  if (event.data.type === 'CALCULATE_CLARITY') {
    const investment = Number(event.data.amount) || 0;
    const redeemable = investment * 0.5;

    self.postMessage({
      tokens: redeemable,
      status: 'Background calculation complete.',
    });
  }
};
