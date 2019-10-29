import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);
 
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('Not-Authorized');
    }
 
    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },

  'tasks.remove'(taskId) {
    check(taskId, String);

    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('Not-Authorized');
    }

    const task = Tasks.findOne(taskId);

    // Make sure task belongs to user
    if (task.owner !== this.userId) {
      throw new Meteor.Error('Not-Authorized');
    }
 
    Tasks.remove(taskId);
  },

  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);

    // Make sure task belongs to user
    if (task.owner !== this.userId) {
      throw new Meteor.Error('Not-Authorized to toggle completed');
    }
 
    Tasks.update(taskId, { $set: { checked: setChecked } });
  },

  'tasks.setPrivate'(taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);

    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('Not-Authorized');
    }
 
    const task = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== this.userId) {
      throw new Meteor.Error('Not-Authorized to toggle privacy');
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
});
