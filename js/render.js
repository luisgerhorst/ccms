
var render = function (couchdb, meta) { // is called after config.json was loaded
	
	this.Theme = Ember.Application.create();
	
	Theme.ApplicationController = Ember.Controller.extend({
		firstName: "Luis",
		lastName: "Gerhorst"
	});
	
	Theme.Router.map(function () {
		this.route('posts');
		this.route('post', { path: '/posts/:post_id' }); // :post_id is the id property of every post
	});
	
	Theme.IndexRoute = Ember.Route.extend({
		setupController: function(controller) {
			controller.set('hello', "The is the index controller");
		}
	});
	
	Theme.PostsRoute = Ember.Route.extend({
		model: function() {
			return Theme.Post.newest();
		}
	});
	
	Theme.Post = Ember.Object.extend();
	
	Theme.Post.reopenClass({
		
		newestPosts: [],
		newest: function () {
			
			var newestPosts = [];
			
			var func = 'all?limit=' + meta.postsPerPage + '&descending=true'; // 2 will be meta.postsPerPage later
			
			couchdb.view('posts', func, function (response, error) {
				
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				
				response.rows.forEach(function (post) {
					newestPosts.addObject(Theme.Post.create(post.value));
				}, this);
				
			}); // loads the newest posts
			
			return this.newestPosts = newestPosts;
			
		}
		
	});
	
};
