onmessage = function(e) {
  console.log('(TS) Message received from main script');
  const workerResult = `Result: ${e.data[0] * e.data[1]}`;
  console.log('(TS) Posting message back to main script');
  postMessage(workerResult);
}

export {}
