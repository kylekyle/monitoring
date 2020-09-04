# Monitoring

A simple, efficient, and lightweight ES module to monitor the DOM for when elements are added, removed, have appeared, have disappeared, or are resized. Internally, this library uses the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver), and [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) APIs. 

```javascript
import monitoring from 'monitoring';

const monitor = monitoring(document.body);

// watch for new elements added to the DOM
monitor.added('div', div => console.log('div added:', div));

// watch for elements removed from the DOM
monitor.removed('.ad', ad => console.log('advert removed:', ad));

// watch for elements to become appear on the page
// what it means to appear or be visible is complicated, details here:
// https://developers.google.com/web/updates/2019/02/intersectionobserver-v2
monitor.appeared('#content', content => console.log('content is visible:', content));

// watch for elements that are no longer visible on the page
monitor.disappeared('img', img => console.log('img is no longer visible:', img));

// watch for when elements are resized
monitor.resized('textarea', textarea => console.log('textarea resized:', textarea));
```

## Installation

Add to your project using [NPM](https://npmjs.com):

```bash
$ npm install monitoring --save
```

You can add `monitoring` directly in your site or download the latest minified version from [jsdelivr](https://cdn.jsdelivr.net/npm/monitoring/dist/monitoring-1.0.3.min.js):

```html
<script type="module">
  import monitoring from 'https://cdn.jsdelivr.net/npm/monitoring/dist/monitoring-1.0.3.min.js';
  
  const monitor = monitoring(document.body);
  ...
</script>
```

## Getting callback details

Callbacks also recieve the observer entry that triggered the callback. This table shows the type of entry each methods recieves:

| Method | Entry type |
| ------ | ---------- |
| `added` | [MutationObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverEntry) |
| `removed` | [MutationObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverEntry) |
| `appeared` | [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `disappeared` | [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `resized` | [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry) |

Here are some examples of how the entry information can be used: 

```javascript
const monitor = monitoring(document.body);

monitor.added('div', (div, entry) => {
  console.log(`div added along with ${entry.addedNodes.length} other nodes`);
});

monitor.appeared('img', (img, entry) => {
  console.log(`An image is ${entry.intersectionRatio*100}% visible`);
});

monitor.resized('textarea', (textarea, entry) => {
  console.log(`textarea is now ${entry.contentRect.width} pixels wide`);
});
```

## Stopping monitors

You can cancel a monitor by calling its `cancel` method. This cancels all callbacks registered against that monitor: 

```javascript
const monitor = monitoring(document.body);
const divAdded = monitor.added('div', console.log);
const divRemoved = monitor.added('div', console.log);

// stops the monitor, including divAdded and divRemoved
monitor.cancel(); 
```

You can also cancel a specific callback:

```javascript
const monitor = monitoring(document.body);
const divAdded = monitor.added('div', console.log);
const divRemoved = monitor.added('div', console.log);

// cancels divAdded, doesn't effect divRemoved
divAdded.cancel(); 
```

Finally, you can cancel by returning `false` from within the callback. **Note:** Your callback must return `false`, not a falsey value like `null` or `undefined`. 

```javascript
const monitor = monitoring(document.body);

// cancels the callback after its first call
monitor.added('div', div => {
  console.log('div added!');
  return false; 
});
```

## IFrames

Monitors support an `iframes` option to include monitoring elements within iframes of the same origin. For example: 

```javascript
const monitor = monitoring(document.body, {iframes: true});

monitor.added('div', div => {
  if (div.ownerDocument != document) {
    console.log('new div in an iframe!');
  }
});
```

## Existing elements

By default, the `added` method will return all existing elements in the DOM that match the given selector and monitor for new ones. You can ignore existing elements by setting the `existing` option to `false`: 

```javascript
const monitor = monitoring(document.body);
monitor.added('.my_class', my_callback, {existing: false});
```

## Performance

Monitors reuse their observers so you should avoid declaring new monitors for the same element. For example:

```javascript
// this only uses one monitor for two callback - do this :-)
const monitor = monitoring(document.body);
monitor.added('div.my_class', div => console.log('my_class added');
monitor.removed('div.my_class', div => console.log('my_class removed');

// this uses two monitors, one for each callback - don't do this :-(
monitoring(document.body).added('div.my_class', div => console.log('my_class added');
monitoring(document.body).removed('div.my_class', div => console.log('my_class removed');
```

Observers were designed to be an efficient alternative to polling the DOM. However, monitoring large chunks of the DOM, like `document` or `document.body` is still expensive. I recommend monitoring the smallest portion of the DOM necessary and cancelling as soon as the monitor is no longer needed. 

Here is an example of using a monitor to find more specific elements for monitoring:

```javascript
// monitor the document body for a #content div
monitoring(document.body).added('#content', content => {

  // monitor the #content div for our class
  monitoring(content).added('.my_class', div => 
    console.log('found our class in the content div!');
  );

  // this cancels the document body monitor
  return false;
});
```

## How is `monitoring` different from [`arrive.js`](https://github.com/uzairfarooq/arrive)?

`arrive.js` is an excellent library and was the inspiration for this project. However, there are some differences: 

* `arrive.js` does not support the `IntersectionObserver` or `ResizeObserver`.
* `arrive.js` does not support traversing into iframes.
* `arrive.js` is not an ES6 module, which makes it [difficult to incorporate into things like webpack](https://github.com/uzairfarooq/arrive/issues/42).
* `arrive.js` pollutes the DOM by decorating all [matched elements](https://github.com/uzairfarooq/arrive/blob/16c5691062e6a081c07882ec4d5fa08f0cdd569f/src/arrive.js#L317) and a [number of prototypes](https://github.com/uzairfarooq/arrive/blob/16c5691062e6a081c07882ec4d5fa08f0cdd569f/src/arrive.js#L448).
* `arrive.js` uses [recursive node matching](https://github.com/uzairfarooq/arrive/blob/16c5691062e6a081c07882ec4d5fa08f0cdd569f/src/arrive.js#L62), which can be slow. 
* `arrive` creates a new `MutationObserver` for [each callback](https://github.com/uzairfarooq/arrive/blob/16c5691062e6a081c07882ec4d5fa08f0cdd569f/src/arrive.js#L183), which can be slow.
* `arrive.js` requires jquery for observing elements from different documents. For example: 

```javascript
// works! 
document.body.arrive('div', console.log);

// does not work :-(
frames[0].document.body.arrive('div', console.log);

// works, but you need jquery 
$(frames[0].document.body).arrive('div', console.log);
```