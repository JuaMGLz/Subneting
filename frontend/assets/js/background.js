(function () {
  const NetApp = (window.NetApp = window.NetApp || {});

  function createNetworkNodes() {
    const bg = document.getElementById("networkBg");
    if (!bg) return;

    const nodeCount = 50;
    const lineCount = 20;
    const segmentCount = 3;

    // Nodos
    for (let i = 0; i < nodeCount; i++) {
      const node = document.createElement("div");
      node.className = "network-node";
      node.style.left = Math.random() * 100 + "%";
      node.style.top = Math.random() * 100 + "%";
      node.style.animationDelay = Math.random() * 2 + "s";
      bg.appendChild(node);
    }

    // Líneas
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement("div");
      line.className = "network-line";
      line.style.left = Math.random() * 80 + "%";
      line.style.top = Math.random() * 100 + "%";
      line.style.width = Math.random() * 200 + 100 + "px";
      line.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      line.style.animationDelay = Math.random() * 3 + "s";
      bg.appendChild(line);
    }

    // Zonas
    for (let i = 0; i < segmentCount; i++) {
      const segment = document.createElement("div");
      segment.className = "segment-zone";
      segment.style.left = Math.random() * 60 + "%";
      segment.style.top = Math.random() * 60 + "%";
      segment.style.width = Math.random() * 200 + 150 + "px";
      segment.style.height = Math.random() * 150 + 100 + "px";
      segment.style.animationDelay = Math.random() * 4 + "s";
      bg.appendChild(segment);
    }
  }

  NetApp.background = { init: createNetworkNodes };
})();
