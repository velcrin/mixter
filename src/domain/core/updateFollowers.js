var subscription = require('./subscription');
var followerProjection = require('./followerProjection');

var UpdateFollowers = function UpdateFollowers(followersRepository){
    var self = this;

    self.register = function register(eventPublisher) {
        eventPublisher
          .on(subscription.UserFollowed, function(event) {
              var projection = followerProjection.create(event.subscriptionId.followee, event.subscriptionId.follower);
              followersRepository.save(projection);
          })
          .on(subscription.UserUnfollowed, function(event) {
              var projection = followerProjection.create(event.subscriptionId.followee, event.subscriptionId.follower);
              followersRepository.remove(projection);
          });
    };
};

exports.create = function create(followersRepository){
    return new UpdateFollowers(followersRepository);
};