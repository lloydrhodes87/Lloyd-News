process.env.NODE_ENV = 'test';

const supertest = require('supertest');
const { expect } = require('chai');
const connection = require('../db/connection');
const app = require('../app');

const request = supertest(app);

describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  describe('/topics', () => {
    const topicObj = {
      description: 'The man, the Mitch, the legend',
      slug: 'mitch',
    };
    it('GET status:200 responds with an array of topic objects', () => request
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).to.have.length(2);
        expect(body.topics[0]).to.eql(topicObj);
      }));
    it('POST status:201 responds with a newly added topic', () => {
      const addTopicObj = {
        description: 'some description',
        slug: 'lloyd',
      };
      return request.post('/api/topics')
        .send(addTopicObj)
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).to.eql(addTopicObj);
        });
    });
    it('POST status:400 client has put in incorrect colums', () => {
      const incorrectObj = {
        badDesc: 'some description',
        badSlugmitch: 'lloyd',
      };
      return request.post('/api/topics')
        .send(incorrectObj)
        .expect(400);
    });
    it('POST status:400 client has used malformed syntax', () => {
      const incorrectObj = { slug: 999, description: 999 };
      return request
        .post('/api/topics')
        .send(incorrectObj)
        .expect(400);
    });
    it('POST status: 422 client sends a body with a duplicate slug ', () => {
      const duplicateSlug = { slug: 'mitch', description: 'The man, the Mitch, the legend' };
      return request
        .post('/api/topics')
        .send(duplicateSlug)
        .expect(422);
    });
    it('DELETE status:405 client has used incorrect method', () => request.delete('/api/topics')
      .expect(405));
    it('GET status:200 responds with an array of article objects for a given topic', () => {
      const expected = {
        author: 'butter_bridge',
        title: 'Living in the shadow of a great man',
        article_id: 1,
        topic: 'mitch',
        comment_count: '13',
        created_at: new Date(1542284514171).toJSON(),
        votes: 100,
      };
      return request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).to.eql(expected);
          expect(body.articles).to.have.length(10);
        });
    });
    it('GET status:200 should accept a query to limit the response', () => request
      .get('/api/topics/mitch/articles?limit=5')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(5);
      }));
    it('GET status:200 should accept a query to limit the response with a default of 10', () => request
      .get('/api/topics/mitch/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(10);
      }));
    it('GET status: 400 client has used incorrect type on queries', () => request
      .get('/api/topics/mitch/articles?limit=text')
      .expect(400));
    it('GET status: 404 client has inputted limit in correct format but doesn\'t exist yet', () => request
      .get('/api/topics/mitch/articles?limit=60000')
      .expect(404));
    it('GET status:200 should accept a query to sort by any column - defaults to date', () => request
      .get('/api/topics/mitch/articles?sort_by=title')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Z');
      }));
    it('GET status:200 client has not used string for sort_by query hence defaults', () => request
      .get('/api/topics/mitch/articles?sort_by=1')
      .expect(200));
    it('GET status: 200 should return a defaut sort_by if given invalid sort by', () => request
      .get('/api/topics/mitch/articles?sort_by=hello')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET status:200 should accept a query to sort by any column - defaults to date', () => request
      .get('/api/topics/mitch/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET status: 404 client inputs an none existing topic id', () => request
      .get('/api/topics/incorrect-topic/articles')
      .expect(404)
      .then((res) => {
        expect(res.body.message).to.equal('article not found');
      }));
    it('POST status 404 client posts to a non existing topic', () => {
      const dataToSend = { title: 'new title', username: 'butter_bridge', body: 'Well? Think about it.' };
      return request
        .post('/api/topics/unknown/articles')
        .send(dataToSend)
        .expect(404);
    });
    it('GET status: 400 client inputs an invalid path', () => request
      .get('/api/topic/mitch/articles/blaaaaa')
      .expect(404));
    it('GET status:200 should accept a query to start on a different page ', () => request
      .get('/api/topics/mitch/articles?limit=10&&sort_by=title&&p=2')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(1);
        expect(body.articles[0].title).to.equal('A');
      }));
    it('GET status:200 should be true if results are sorted in ascending order', () => request
      .get('/api/topics/mitch/articles?sort_by=title&&sort_ascending=true')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('A');
      }));
    it('GET status:200 should have a default order of descending', () => request
      .get('/api/topics/mitch/articles?sort_by=title')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Z');
      }));
    it('GET status:200 should default to descending when any other value is put in', () => request
      .get('/api/topics/mitch/articles?sort_by=title&&sort_ascending=blahblah')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Z');
        expect(body.articles[body.articles.length - 1].title).to.equal('Am I a cat?');
      }));
    it('POST status:201 responds with a newly added article', () => {
      const dataToSend = {
        title: 'new title',
        username: 'butter_bridge',
        body: 'Well? Think about it.',
      };
      return request
        .post('/api/topics/mitch/articles')
        .send(dataToSend)
        .expect(201)
        .then(({ body }) => {
          expect(body.article.article_id).to.eql(13);
          expect(body.article.title).to.eql('new title');
          expect(body.article.votes).to.eql(0);
          expect(body.article.username).to.eql('butter_bridge');
          expect(body.article.topic).to.eql('mitch');
          expect(body.article.body).to.eql('Well? Think about it.');
        });
    });
    it('POST status: 404 client is posting to incorrect endpoint', () => request
      .post('/api/topics/mitchh/artticles')
      .expect(404));
    it('POST status:400 client has put in incorrect colums', () => {
      const incorrectObj = { title: 'new title', username: 'butter_bridge', body: 'Well? Think about it.' };
      return request.post('/api/topics')
        .send(incorrectObj)
        .expect(400);
    });
    it('DELETE status:405 client has used incorrect method', () => request
      .delete('/api/topics/mitch/articles')
      .expect(405));
  });
  describe('/articles', () => {
    it('GET status: 200 and responds with an array of article objects', () => request
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(10);
      }));
    it('GET status: 404 client has used an incorrect endpoint', () => request
      .get('/api/articles/incorrect')
      .expect(404));
    it('GET status: 200 and responds with all keys', () => {
      const expected = {
        author: 'butter_bridge',
        title: 'Living in the shadow of a great man',
        article_id: 1,
        topic: 'mitch',
        comment_count: '13',
        created_at: new Date(1542284514171).toJSON(),
        votes: 100,
      };
      return request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).to.eql(expected);
        });
    });
    it('GET: status:404 client has requested a none existing endpoint', () => request
      .get('/api/artic')
      .expect(404));
    it('GET status:200 should accept a query to limit the response with a default of 10', () => request
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(10);
      }));
    it('GET status: 400 client has used incorrect type on queries', () => request
      .get('/api/articles?limit=text')
      .expect(400));
    it('GET status:200 should be true if results are sorted in ascending order', () => request
      .get('/api/articles?sort_ascending=true')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Moustache');
      }));
    it('GET status:200 should have a default order of descending', () => request
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Z');
      }));
    it('GET status:200 should default to descending when any other value is put in', () => request
      .get('/api/articles?sort_ascending=wrongvalue')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
        expect(body.articles[body.articles.length - 1].title).to.equal('Seven inspirational thought leaders from Manchester UK');
      }));
    it('GET status:200 should accept a query to start on a different page ', () => request
      .get('/api/articles?limit=5&&p=2')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).to.have.length(5);
        expect(body.articles[0].title).to.equal('A');
      }));
    it('GET status 400 client has used none integer format for limit query', () => request
      .get('/api/articles?limit=five')
      .expect(400));
    it('GET status 400 client has used none integer format for p query', () => request
      .get('/api/articles?p=five')
      .expect(400));
    it('GET status:200 should accept a query to sort by any column - defaults to date', () => request
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Z');
      }));
    it('GET status:200 responds with default response if given invalid sort_by', () => request
      .get('/api/articles?sort_by=1')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET status:200 should accept a query to sort by any column - defaults to date', () => request
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET status:200 should respond with an article by id with relevant properties', () => {
      const articleObj = {
        author: 'butter_bridge', body: 'I find this existence challenging', title: 'Living in the shadow of a great man', article_id: 1, topic: 'mitch', comment_count: '13', created_at: new Date(1542284514171).toJSON(), votes: 100,
      };
      return request
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body.article).to.eql(articleObj);
        });
    });
    it('GET status:404 client has entered an endpoint that doesn\'st exist', () => request
      .get('/api/articles/12445')
      .expect(404));
    it('GET status:400 client has input a string instead of a number as a query', () => request
      .get('/api/articles/?limit=string')
      .expect(400));
    it('PATCH status:200 should respond with successful patch of vote data', () => {
      const updateVote = {
        inc_votes: 10,
      };
      return request
        .patch('/api/articles/2')
        .send(updateVote)
        .expect(200)
        .then(({ body }) => {
          expect(body.article.votes).to.equal(10);
        });
    });
    it('PATCH status:200 should respond with successful patch of vote data with a negative figure', () => {
      const updateVote = {
        inc_votes: -10,
      };
      return request
        .patch('/api/articles/2')
        .send(updateVote)
        .expect(200)
        .then(({ body }) => {
          expect(body.article.votes).to.equal(-10);
        });
    });
    it('PATCH status: 400 client has input votes in incorrect format', () => {
      const updateVote = {
        inc_votes: 'ten',
      };
      return request
        .patch('/api/articles/2')
        .send(updateVote)
        .expect(400);
    });
    it('PATCH status: 200 client has made a patch request with an empty body', () => {
      const updateVote = { inc_votes: '' };
      return request
        .patch('/api/articles/2')
        .send(updateVote)
        .expect(200);
    });
    it('PATCH status: 404 client has tried to patch to a none existent endpoint', () => {
      const updateVote = {
        inc_votes: 10,
      };
      return request
        .patch('/api/articles/45')
        .send(updateVote)
        .expect(404);
    });
    it('DELETE status: 200 responds with an empty object', () => request
      .delete('/api/articles/1')
      .expect(204)
      .then((res) => {
        expect(res.body).to.eql({});
        return request
          .get('/api/articles/1')
          .expect(404);
      }));
    it('DELETE status: 404 responds not found when given a none existent article id', () => request
      .delete('/api/articles/1000')
      .expect(404));
    it('GET status: 200 responds with an array of comments from article id with a default limit of 10', () => request
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).to.have.length(10);
      }));
    it('GET status: 200 responds with an array of comments with a set limit', () => request
      .get('/api/articles/1/comments?limit=5')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).to.have.length(5);
      }));
    it('GET status: 400 client has used incorrect type on queries', () => request
      .get('/api/articles/1/comments?limit=text')
      .expect(400));
    it('GET status: 200 responds with an array of comments from article id with a default sort_by of date', () => request
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments[0].votes).to.equal(14);
        expect(body.comments[0].comment_id).to.equal(2);
      }));
    it('GET status: 200 responds with an array of comments from article id with a set sort_by of comment_id', () => request
      .get('/api/articles/5/comments?sort_by=comment_id')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments[0].votes).to.equal(1);
        expect(body.comments[0].comment_id).to.equal(15);
      }));
    it('GET status: 200 client has used no existing query key and is sent to defaults', () => request
      .get('/api/articles/1/comments?wrong=text')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments[0].votes).to.equal(14);
        expect(body.comments[0].comment_id).to.equal(2);
      }));
    it('GET status: 400 client has sorted by column that doesn\'t exist', () => request
      .get('/api/articles/1/comments?sort_by=nothing')
      .expect(400));
    it('GET status:200 should accept a query to start on a different page ', () => request
      .get('/api/articles/1/comments?limit=5&&p=2')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).to.have.length(5);
        expect(body.comments[0].body).to.equal('Lobster pot');
      }));
    it('GET status:200 should be true if results are sorted in ascending order', () => request
      .get('/api/articles/1/comments?sort_ascending=true')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments[0].comment_id).to.equal(18);
      }));
    it('GET status:200 should have a default order of descending', () => request
      .get('/api/articles/1/comments?sort_by=comment_id')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments[0].comment_id).to.equal(18);
      }));
    it('POST status:201 responds with the newly added comment ', () => {
      const addTopicObj = { username: 'butter_bridge', body: 'this is a test comment' };

      return request.post('/api/articles/1/comments')
        .send(addTopicObj)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment.comment_id).to.equal(19);
          expect(body.comment.body).to.equal('this is a test comment');
        });
    });
    it('POST status:422 client has input an invalid article_id of the incorrect type', () => {
      const addTopicObj = { username: 'butter_bridge', body: 'this is a test comment' };
      return request
        .post('/api/articles/88/comments')
        .send(addTopicObj)
        .expect(422);
    });
    it('POST status:422 client has input an invalid username', () => {
      const addTopicObj = { username: 'unknown', body: 'this is a test comment' };
      return request
        .post('/api/articles/1/comments')
        .send(addTopicObj)
        .expect(422);
    });

    it('POST status:404 client has input a none existing article_id', () => {
      const addTopicObj = { username: 'butter_bridge', body: 'this is a test comment' };
      return request
        .post('/api/articles/lloyd/comments')
        .send(addTopicObj)
        .expect(404);
    });
    it('PATCH status:200 should respond with successful patch of vote data', () => {
      const updateVote = {
        inc_votes: 10,
      };
      return request
        .patch('/api/articles/5/comments/14')
        .send(updateVote)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment.votes).to.equal(26);
        });
    });
    it('PATCH status:200 should respond with successful patch of unchanged vote data when body is blank', () => {
      const updateVote = { inc_votes: '' };
      return request
        .patch('/api/articles/5/comments/14')
        .send(updateVote)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment.votes).to.equal(16);
        });
    });

    it('PATCH status:200 should respond with successful patch of vote data with a negative figure', () => {
      const updateVote = {
        inc_votes: -10,
      };
      return request
        .patch('/api/articles/1/comments/5')
        .send(updateVote)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment.votes).to.equal(-10);
        });
    });
    it('PATCH status: 400 client has input votes in incorrect format', () => {
      const updateVote = {
        inc_votes: 'ten',
      };
      return request
        .patch('/api/articles/1/comments/1')
        .send(updateVote)
        .expect(400);
    });
    xit('PATCH status: 404 client used non existing comment id', () => {
      const updateVote = { inc_votes: '10' };
      return request
        .patch('/api/articles/1/comments/1000')
        .send(updateVote)
        .expect(404);
    });
    it('DELETE status: 204 should respond with an empty object', () => request
      .delete('/api/articles/1/comments/1')
      .expect(204)
      .then((res) => {
        expect(res.body).to.eql({});
      }));
    it('DELETE status: 404 client is trying to delete a comment that doesn\'t exist', () => request
      .delete('/api/articles/1/comments/4000')
      .expect(404));
    it('DELETE status: 404 client is trying to delete a comment with a none existent article id', () => request
      .delete('/api/articles/100000/comments/1')
      .expect(404));
  });

  describe('/users', () => {
    it('GET status: 200 reponds with an array of user objects', () => request
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(body.users).to.have.length(3);
        expect(body.users[0].username).to.equal('butter_bridge');
      }));
    it('PATCH status: 405 client has used the incorrect method', () => request
      .patch('/api/users')
      .expect(405));
    it('DELETE status: 405 client has used the incorrect method', () => request
      .delete('/api/users')
      .expect(405));
    it('GET status: 200 responds with a user object', () => {
      const userObj = { username: 'butter_bridge', avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg', name: 'jonny' };
      return request
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body }) => {
          expect(body.user).to.eql(userObj);
        });
    });
    // it('GET status: 404 client has input a username that doesn\'t exist', () => request
    //   .get('/api/users/butter_br')
    //   .expect(404));
  });
});
