var idGenerator = require('../../idGenerator');

var UserIdentityId = exports.UserIdentityId = function UserIdentity(email){
    this.email = email;

    Object.freeze(this);
};

UserIdentityId.prototype.toString = function toString(){
    return 'UserIdentity:' + this.email;
};

var UserRegistered = exports.UserRegistered = function UserRegistered(userIdentityId){
    this.userIdentityId = userIdentityId;

    Object.freeze(this);
};

var UserConnected = exports.UserConnected = function UserConnected(sessionId, userIdentityId, connectedAt){
    this.userIdentityId = userIdentityId;
    this.sessionId = sessionId;
    this.connectedAt = connectedAt;

    Object.freeze(this);
};

var DecisionProjection = function DecisionProjection(events){
    var self = this;

    events.forEach(function(event) {
        if(event instanceof UserRegistered){
            self.id = event.userIdentityId;
        }
    });
};

var UserIdentity = function UserIdentity(events){
    var self = this;

    var projection = new DecisionProjection(events);

    self.logIn = function logIn(publishEvent){
        publishEvent(new UserConnected(idGenerator.generate(), projection.id, new Date()));
    };
};

exports.register = function register(publishEvent, email){
    var id = new UserIdentityId(email);
    publishEvent(new UserRegistered(id));
};

exports.create = function create(events){
    return new UserIdentity(events);
};