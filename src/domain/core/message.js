var idGenerator = require('../../idGenerator');
var valueType = require('../../valueType');
var decisionProjection = require('../decisionProjection');
var _ = require('lodash');

var MessageId = exports.MessageId = valueType.extends(function MessageId(id) {
  this.id = id;
}, function toString() {
  return 'Message:' + this.id;
});

var MessageQuacked = exports.MessageQuacked = function MessageQuacked(messageId, author, content) {
  this.messageId = messageId;
  this.author = author;
  this.content = content;

  Object.freeze(this);
};

MessageQuacked.prototype.getAggregateId = function getAggregateId() {
  return this.messageId;
};

var MessageRequacked = exports.MessageRequacked = function MessageRequacked(messageId, requacker) {
  this.messageId = messageId;
  this.requacker = requacker;

  Object.freeze(this);
};

MessageRequacked.prototype.getAggregateId = function getAggregateId() {
  return this.messageId;
};

var MessageDeleted = exports.MessageDeleted = function MessageDeleted(messageId) {
  this.messageId = messageId;

  Object.freeze(this);
};

MessageDeleted.prototype.getAggregateId = function getAggregateId() {
  return this.messageId;
};

var MessageDescription = exports.MessageDescription = function MessageDescription(author, content){
    this.author = author;
    this.content = content;

    Object.freeze(this);
};

var Message = function Message(events){
    var self = this;

  var projection = decisionProjection.create()
    .register(MessageQuacked, function(event) {
      this.messageId = event.messageId;
      this.author = event.author;
    })
    .register(MessageRequacked, function(event) {
      if (!this.requackers) {
        this.requackers = [];
      }
      this.requackers.push(event.requacker);
    })
    .register(MessageDeleted, function() {
      this.deleted = true;
    })
    .apply(events);

  self.requack = function requack(publishEvent, requacker) {
    if (projection.deleted || projection.author.equals(requacker) || _.includes(projection.requackers, requacker)) {
      return;
    }

    publishEvent(new MessageRequacked(projection.messageId, requacker));
  };

  self.delete = function(publishEvent, deleter) {
    if (!projection.deleted && projection.author.equals(deleter)) {
      publishEvent(new MessageDeleted(projection.messageId));
    }
  };
};

exports.quack = function quack(publishEvent, author, content) {
  var messageId = new MessageId(idGenerator.generate());

  publishEvent(new MessageQuacked(messageId, author, content));

  return messageId;
};

exports.create = function create(events) {
  return new Message(events);
};