var valueType = require('../../valueType');
var decisionProjection = require('../decisionProjection');

var SubscriptionId = exports.SubscriptionId = valueType.extends(function SubscriptionId(follower, followee){
    this.follower = follower;
    this.followee = followee;

    Object.freeze(this);
}, function toString() {
    return 'Subscription:' + this.follower + ' -> ' + this.followee;
});

var UserFollowed = exports.UserFollowed = function UserFollowed(subscriptionId){
    this.subscriptionId = subscriptionId;

    Object.freeze(this);
};

UserFollowed.prototype.getAggregateId = function getAggregateId(){
    return this.subscriptionId;
};

var UserUnfollowed = exports.UserUnfollowed = function UserUnfollowed(subscriptionId){
    this.subscriptionId = subscriptionId;

    Object.freeze(this);
};

UserUnfollowed.prototype.getAggregateId = function getAggregateId(){
    return this.subscriptionId;
};

var FolloweeMessageQuacked = exports.FolloweeMessageQuacked = function FolloweeMessageQuacked(subscriptionId, messageId){
    this.subscriptionId = subscriptionId;
    this.messageId = messageId;

    Object.freeze(this);
};

FolloweeMessageQuacked.prototype.getAggregateId = function getAggregateId(){
    return this.subscriptionId;
};

var Subscription = function(event) {
    var self = this;

    var projection = decisionProjection.create()
      .register(UserFollowed, function(event) {
          this.subscriptionId = event.subscriptionId;
      })
      .apply(event);

    self.unfollow = function(publishEvent) {
        publishEvent(new UserUnfollowed(projection.subscriptionId));
    };

    self.notifyFollower = function(publishEvent, messageId) {
        publishEvent(new FolloweeMessageQuacked(projection.subscriptionId, messageId));
    };
};

exports.followUser = function followUser(publishEvent, follower, followee) {
    var subscriptionId = new SubscriptionId(follower, followee);

    publishEvent(new UserFollowed(subscriptionId));

    return subscriptionId;
};

exports.create = function create(event) {
    return new Subscription(event);
}