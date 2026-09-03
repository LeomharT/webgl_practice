let index = 0;

fetch('/data.json')
  .then((res) => res.json())
  .then((data) => {
    this.postMessage(data[index]);
    setInterval(() => {
      this.postMessage(data[++index % data.length]);
    }, 300);
  })
  .catch((err) => {
    this.reportError('mock worker failed to load data.json', err);
  });
