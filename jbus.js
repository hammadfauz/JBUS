//JBUS constructor and initializer
var JBUS = function (options) {
  if (options == null)
    options = {};
  //time between monitoring message queue
  this.ticker = options.ticker || 50;
  //length of endpoint ids (increase to support more endpoints)
  this.idLength = options.idLength || 5;
  if (options.startPaused)
    this.pauseFlushQueue();
  else
    this.unpauseFlushQueue();
};
JBUS.prototype = (function () {
  //Methods to expose via endpoints
  var endpointPrivate = {
    addSubscriber : function (subId) {
      if (typeof subId.jbusId === 'string' &&
          this.subscribers.indexOf(subId.jbusId) === -1) {
        this.subscribers.push(subId.jbusId);
      } else if (subId.length >= 0) {
        for (i = 0; i < subId.length; i++) {
          if (typeof subId[i].jbusId === 'string' &&
              this.subscribers.indexOf(subId[i].jbusId) === -1) {
            this.subscribers.push(subId[i].jbusId);
          }
        }
      }
    },
    subscribeTo : function (target) {
      if (typeof target.jbusId === 'string' &&
          target.subscribers.indexOf(this.jbusId) === -1) {
        target.subscribers.push(this.jbusId);
      }
    },
    deleteSubscriber : function (subId) {
      if (typeof subId.jbusId === 'string') {
        var subIndex = this.subscribers.indexOf(subId.jbusId);
        if (subIndex >= 0) {
          this.subscribers.splice(subIndex, 1);
        }
      } else if (subId.length >= 0) {
        for (i = 0; i < subId.length; i++) {
          var subIndex = this.subscribers.indexOf(subId[i].jbusId);
          if (subIndex >= 0) {
            this.subscribers.splice(subIndex,1)
          }
        }
      }
    },
    send2Subscribers : function (payload) {
      for (i = 0; i < this.subscribers.length ; i++)
         this.sendMsg(this.subscribers[i], payload);
    }
  };
  var makeEndpoint = function (targetObject) {
    if (targetObject.jbusId == null) {
      var characters = '0123456789abcdefghijklmnopqrstuvwxyz';
      var Id = '';
      var JBUScontext = this;
      do {
        for (i = 0; i < this.idLength; i++) {
          Id += characters[Math.ceil(100*Math.random()%26)];
        }
      } while (typeof this.endpoints[Id] != 'undefined')
      //Exposed Endpoint interface
      targetObject.jbusId = Id;
      targetObject.sendMsg = function (destinationId, payload) {
        queueMsg(this.jbusId, destinationId, payload, JBUScontext);
      };
      targetObject.onGetMsg = function (payload, source){
        console.log(payload);
      };
      targetObject.subscribers = [];
      targetObject.addSubscriber = endpointPrivate.addSubscriber;
      targetObject.subscribeTo = endpointPrivate.subscribeTo;
      targetObject.deleteSubscriber = endpointPrivate.deleteSubscriber;
      targetObject.send2Subscribers = endpointPrivate.send2Subscribers;
      this.endpoints[Id] = targetObject;
    }
    return targetObject;
  };
  var unMakeEndpoint = function (targetObject) {
    delete this.endpoints[jbusId];
    delete targetObject.jbusId;
    delete targetObject.sendMsg;
    delete targetObject.onGetMsg;
    delete targetObject.subscribers;
    delete targetObject.addSubscriber;
    delete targetObject.subscribeTo;
    delete targetObject.send2Subscribers;
  };
  var queueMsg = function (sourceId, destinationId, payload, JBUScontext) {
    JBUScontext.msgQueue.push({
      source : sourceId,
      destination : destinationId,
      payload : payload
    });
  };
  var startFlushQueue = function(JBUScontext) {
    if (!JBUScontext.isFlushQueuePaused) {
      if (JBUScontext.msgQueue.length === 0) {
        window.setTimeout(function(){
          startFlushQueue(JBUScontext);
        }, JBUScontext.ticker);
      } else {
        var currentMsg = JBUScontext.msgQueue.shift();
        var destination = JBUScontext.endpoints[currentMsg.destination];
        destination.onGetMsg(currentMsg.payload, currentMsg.source);
        startFlushQueue(JBUScontext);
      }
    }
  };
  //Exposed bus interface
  return {
    constructor : JBUS,
    endpoints : {},
    msgQueue : [],
    isFlushQueuePaused : true,
    makeEndpoint : makeEndpoint,
    pauseFlushQueue : function() {
      this.isFlushQueuePaused = true;
    },
    unpauseFlushQueue : function() {
      this.isFlushQueuePaused = false;
      startFlushQueue(this);
    }
  };
})();
