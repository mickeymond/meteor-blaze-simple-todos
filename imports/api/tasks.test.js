/* eslint-env mocha */
 
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import { assert } from 'chai';
 
import { Tasks } from './tasks.js';
 
if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      let loggedInUser, taskId, fakeUserId;

      before(() => {
        Meteor.users.remove({});
        Accounts.createUser({username: 'testuser', password: 'testuser'});
        loggedInUser = Meteor.users.findOne({ username: 'testuser' });
        fakeUserId = Random.id();
      });
 
      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: loggedInUser._id,
          username: loggedInUser.username,
        });
      });

      it('Can insert task if logged in', () => {
        const inserTask = Meteor.server.method_handlers['tasks.insert'];
 
        const invocation = { userId: loggedInUser._id };
 
        inserTask.apply(invocation, ['Welcome Here']);
 
        assert.equal(Tasks.find().count(), 2);
      });

      it('Cannot insert task if not logged in', () => {
        const inserTask = Meteor.server.method_handlers['tasks.insert'];
 
        const invocation = { userId: fakeUserId };
 
        assert.throws(() => {
          inserTask.apply(invocation, ['Welcome Here']);
        });
 
        assert.equal(Tasks.find().count(), 1);
      });

      it('Can delete owned task', () => {
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
 
        const invocation = { userId: loggedInUser._id };
 
        deleteTask.apply(invocation, [taskId]);
 
        assert.equal(Tasks.find().count(), 0);
      });

      it('Cannot delete someone else task', () => {
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
 
        const invocation = { userId: fakeUserId };
 
        assert.throws(() => {
          deleteTask.apply(invocation, [taskId]);
        });
 
        assert.equal(Tasks.find().count(), 1);
      });

      it('Can set own task checked', () => {
        const setTaskChecked = Meteor.server.method_handlers['tasks.setChecked'];
 
        const invocation = { userId: loggedInUser._id };

        const task = Tasks.findOne(taskId);

        const oldChecked = task.checked;
 
        setTaskChecked.apply(invocation, [taskId, !oldChecked]);
 
        assert.equal(Tasks.findOne(taskId).checked, !oldChecked);
      });

      it('Cannot set someone task checked', () => {
        const setTaskChecked = Meteor.server.method_handlers['tasks.setChecked'];
 
        const invocation = { userId: fakeUserId };

        const task = Tasks.findOne(taskId);

        const oldChecked = task.checked;
 
        assert.throws(() => {
          setTaskChecked.apply(invocation, [taskId, !oldChecked]);
        });
 
        assert.equal(Tasks.findOne(taskId).checked, oldChecked);
      });

      it('Can set own task private', () => {
        const setOwnTaskPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
 
        const invocation = { userId: loggedInUser._id };

        const task = Tasks.findOne(taskId);

        const oldPrivate = task.private;
 
        setOwnTaskPrivate.apply(invocation, [taskId, !oldPrivate]);
 
        assert.equal(Tasks.findOne(taskId).private, !oldPrivate);
      });

      it('Cannot set someone task private', () => {
        const setOwnTaskPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
 
        const invocation = { userId: fakeUserId };

        const task = Tasks.findOne(taskId);

        const oldPrivate = task.private;
 
        assert.throws(() => {
          setOwnTaskPrivate.apply(invocation, [taskId, !oldPrivate]);
        });
 
        assert.equal(Tasks.findOne(taskId).private, oldPrivate);
      });

      it('Can view own tasks and non-private tasks', () => {
        Tasks.insert({
          text: 'public task',
          createdAt: new Date(),
          owner: fakeUserId,
          username: 'fakeuser',
        });
        
        const tasksPublication = Meteor.server.publish_handlers['tasks'];

        const invocation = { userId: loggedInUser._id };
        
        const tasks = tasksPublication.apply(invocation);

        assert.equal(tasks.count(), 2);
      });

      it('Cannot view someone private tasks', () => {
        Tasks.insert({
          text: 'private task',
          createdAt: new Date(),
          owner: fakeUserId,
          username: 'fakeuser',
          private: true
        });

        const tasksPublication = Meteor.server.publish_handlers['tasks'];

        const invocation = { userId: loggedInUser._id };
        
        const tasks = tasksPublication.apply(invocation);

        assert.equal(tasks.count(), 1);
      });
    });
  });
}
