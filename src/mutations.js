import monitoring from './monitoring';

monitoring.addModule(function(target, options) {
  const mutationMonitors = [];

  const mutations = new MutationObserver(entries => {
    entries.forEach(entry => {
      for (const monitor of mutationMonitors) {
        for (let node of monitor.nodes(entry)) {
          if (node.matches && node.matches(monitor.selector)) {
            if (monitor.callback(node, entry) == false) {
              removeMutationMonitor(monitor);
              break;
            }
          }
        }
      }
    });
  });

  // returns true if we can access this iframe
  // https://bit.ly/iframe-loaded
  const accessible = iframe => {
    try {
      return Boolean(iframe.contentDocument);
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  // iframe's are initially loaded with a dummy document, so you have 
  // to wait until their real document has loaded to hook them
  // https://bit.ly/iframe-loaded
  const loaded = (iframe, callback) => {
    if (accessible(iframe)) {
      const blank = "about:blank";
      const src = iframe.src.trim();
      const href = iframe.contentWindow.location.href;
      const ready = iframe.contentDocument.readyState === "complete";

      const load = () => {  
        if (accessible(iframe)) {
          callback(iframe.contentDocument);
        }
        iframe.removeEventListener('load', load);
      }

      if (ready) {
        if(href === blank && src !== blank && src !== "") {      
          iframe.addEventListener('load', load);
        } else {
          callback(iframe.contentDocument);
        }
      } else {
        iframe.addEventListener('load', load);
      }
    }
  }

  const addMutationMonitor = monitor => {
    mutationMonitors.push(monitor);

    // we just added the first monitor, so start observing
    if (mutationMonitors.length == 1) {
      if (options.iframes) {
        this.added('iframe', iframe =>
          loaded(iframe, doc => 
            mutations.observe(doc, { subtree: true, childList: true })
          )
        );
      }
      
      mutations.observe(target, { subtree: true, childList: true });
    } 

    return { cancel: () => removeMutationMonitor(monitor) }
  }

  const removeMutationMonitor = monitor => {
    const index = mutationMonitors.indexOf(monitor);

    if (index > -1) {
      mutationMonitors.splice(index, 1);
    }

    if (mutationMonitors.length == 0) {
      mutations.disconnect();
    }
  }

  this.added = (selector, callback, {existing=true}={}) => {
    // check the target for pre-existing nodes matching this selector
    if (existing) {
      const targets = [target];

      // check iframes within this target for pre-existing content 
      // matching this selector. Note that this means we will recurse
      // into iframes when creating Monitors with iframes=true 
      if (options.iframes) {
        for (let iframe of target.querySelectorAll('iframe')) {
          if (accessible(iframe)) {
            targets.push(iframe.contentDocument);
          }
        }
      }

      for (let target of targets) {
        for (let node of target.querySelectorAll(selector)) {
          if (callback(node, null) === false) {
            return { cancel: () => {} };
          }
        }
      }
    }

    return addMutationMonitor({
      selector: selector,
      callback: callback,
      nodes: entry => entry.addedNodes
    });
  },

  this.removed = (selector, callback) => {
    return addMutationMonitor({
      selector: selector,
      callback: callback,
      nodes: entry => entry.removedNodes
    });
  };

  return () => {
    mutations.disconnect();
    mutationMonitors.splice(0, mutationMonitors.length);
  }
});