JBUS
====
A bus for inter-object communication

Installation
============
- install as a bower package
```
bower install JBUS
```

Usage
=====
- create a bus instance
```
var myBus = new JBUS();
```
- Add an endpoint (or two)
```
var el = document.createElement('div');
var dataObj = {};
myBus.makeEndpoint(el);
myBus.makeEndpoint(dataObj);
```
- Add el as subscriber to dataObj or make el subscribe to dataObj
```
dataObj.addSubscriber(el); // or
el.subscribeTo(dataObj);
```
- el can react to the message sent
```
el.onGetMsg = function (msg, source) {
 el.innerHTML = msg;
};
```
- send a message to subscriber
```
dataObj.send2Subscribers(msg);
```

Other functionality
===================
- remove endpoints via ```unMakeEndpoint```
- add multiple subscribers using an array of objects
- remove subscriber(s)
- send a single message to an object without making it subscribe ```endpoint.sendMsg(targetObj.jbusId, msg)```
- pause/unpause sending messages ```myBus.pauseFlushQueue(); myBus.unPausFlushQueue()```
- Options to initialize a bus:
 - ticker : time in ms between checking for messages in queue. Default is 50
 - idLength : length of address string of endpoints. Default is 5
 - startPaused : if true, you have to unpauseFlushQueue() to make bus operational. Default is false
