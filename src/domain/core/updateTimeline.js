var message = require('./message');
var timelineMessageProjection = require('./timelineMessageProjection');

var UpdateTimeline = function UpdateTimeline(timelineMessageRepository){
    var self = this;

    self.register = function(eventPublisher) {
        eventPublisher.on(message.MessageQuacked, function(event) {
            var projection = timelineMessageProjection.create(event.author, event.author, event.content, event.messageId);
            timelineMessageRepository.save(projection);
        });
    };
};

exports.create = function(timelineMessageRepository){
    return new UpdateTimeline(timelineMessageRepository);
};