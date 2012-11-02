
var _loaded = false,
	_allNpcs = [],
	_index = 0;
	_currentSlide = 0;
	_numSlides = 0;
	_curNpc = null;
	_answered = false;
	_who = null;

$game.$npc = {

	ready: false,
	hideTimer: null,
	isResource: false,
	isChat: false,

	init: function() {
		//load all the npc info from the DB store it in an array
		//where the index is the id of the npc / mapIndex
		ss.rpc('game.npc.getNpcs', function(response) {
			//iterate through repsonses, create a key 
			//with the id and value is the object
			for(var i = 0; i < response.length; i += 1) {
				var stringId = String(response[i].id);
				_allNpcs[stringId] = response[i];
				_allNpcs[stringId].counter = 0;
				_allNpcs[stringId].currentFrame = 0;
			}  
			_loaded = true;
			$game.$npc.ready = true;
		});

		//bind all the buttons 
		
				
	},

	show: function() {
		if(!$game.$npc.isResource && !$game.$npc.isChat) {
			var stringId = String(_index);
			_curNpc = _allNpcs[stringId];
			
			//if this is false, it means we clicked the npc square 
			//that is the top one (which doesn't have a unique id in our list
			//but rather corresponds to the one below it)
			if(!_curNpc) {
				_index += $game.TOTAL_WIDTH;
				stringId = String(_index);
				_curNpc = _allNpcs[stringId];
			}

			_who = _allNpcs[stringId].name;

			if($game.$player.currentLevel === _curNpc.level) {
				$game.$npc.isResource = true;
				$game.$npc.showPrompt();
			}
			else {
				$game.$npc.isChat = true;
				$game.$npc.showChat();
			}
		}
		
	},
	//returns local x,y grid data based on mouse location
	showPrompt: function() {
		//window overlay?
		//check index below no exist

		//figure out which npc was clicked
		//this was set on the click if an npc was clicked

		
		//this number should be dynamically generated based on html content
		//reset the slide to 0 
		_currentSlide = 0;

		//the prompt looks like a chat, so show the damn chat son
		var speak = 'I have a resource about (pull from db), would you like to see it?',
			buttons = '<button class="btn btn-success">Yes</button><button class="btn btn-danger">No</button>';

		$('.speechBubble').css('height',55);
		$('.speechBubble').append('<p><span class="speakerName">'+_who+': </span>'+speak+buttons+'</p>').slideDown(function() {
			$(".speechBubble .btn-success").bind("click", (function () {
				$game.$npc.showResource();
			}));
			$(".speechBubble .btn-danger").bind("click", (function () {
				$game.$npc.hideChat();
			}));
		});
					
	},

	showResource: function() {

		_numSlides = 2;

		$('.resourceStage').empty();
		$('.resourceStage').load(_curNpc.resource.url,function() {
			_numSlides = $('.resourceStage .pages > .page').length;
		});
		
		$('.speechBubble').slideUp(function() {
			$('.speechBubble').empty();
			$game.$npc.isChat = false;
			$game.$npc.isResource = true;
			$(".speechBubble .btn-success").unbind("click");
			$(".speechBubble .btn-danger").unbind("click");

			//ready to show the resource now 
			var speak = _curNpc.dialog.question[0];
			$('.resourceArea').empty();
			$game.$npc.addContent();
			$game.$npc.addButtons();
			$('.resourceArea').slideDown();
		});
		
	},

	addButtons: function() {
	//determine which buttons to put on the resource area 
	//based on page number, if its a form yet, etc.
	//buttons: next, back, answer, close
	//bind functionality

	//assume that the buttons were removed before 
		
		

	//if its been answered, we have a close button
		if(_answered) {
			$('.resourceArea').append('<button class="btn btn-primary closeButton">Close</button>');
			$('.closeButton').text('Close');
			$(".closeButton").bind("click", (function () {
				$game.$npc.hideResource();
			}));
		}
		else {
			//if its the first page, we DEF. have a next and no back
			if(_currentSlide === 0) {
				$('.resourceArea').append('<button class="btn btn-primary nextButton">Next</button>');		
				$('.nextButton').text('Next');
				$(".nextButton").bind("click", (function () {
					$game.$npc.nextSlide();
				}));
			}
			
			//if its not the first page or the last page, we have both
			else if(_currentSlide > 0 && _currentSlide < _numSlides) {
				$('.resourceArea').append('<button class="btn btn-primary nextButton">Next</button><button class="btn btn-inverse backButton">Back</button>');				
				$('.nextButton').text('Next');
				$('.backButton').text('Back');
				$(".nextButton").bind("click", (function () {
					$game.$npc.nextSlide();
				}));
				$(".backButton").bind("click", (function () {
					$game.$npc.previousSlide();
				}));
			}

			//if its the last page, we have an answer button and a back
			else if(_currentSlide === _numSlides) {
				$('.resourceArea').append('<button class="btn btn-success answerButton">Answer</button><button class="btn btn-inverse backButton">Back</button>');				
				$('.answerButton').text('Answer');
				$('.backButton').text('Back');
				$(".answerButton").bind("click", (function () {
					$game.$npc.submitAnswer();
				}));
				$(".backButton").bind("click", (function () {
					$game.$npc.previousSlide();
				}));
			}	
		}
	},

	addContent: function() {

		//add the close button
		
		$('.resourceArea').append('<a href="#" style="font-size: 24px;"><i class="icon-remove-sign icon-large"></i></a>');
		$(".resourceArea a i").bind("click", (function () {
			$game.$npc.hideResource();
			return false;
		}));
		//add the answer form
		if(_answered) {
			var speak = 'Well done!  Take this (thing from db) and solve that riddle!';
			$('.resourceArea').append('<p><span class="speakerName">'+_who+': </span>'+speak+'</p>');
			$('.resourceArea').append('<p><br><img src="http://www.fordesigner.com/imguploads/Image/cjbc/zcool/png20080525/1211728737.png"></p>');		
		}
		else {
			if(_currentSlide === _numSlides) {
				var finalQuestion = _curNpc.dialog.question[1],
					inputBox = '<form><input></input></form>';	
				$('.resourceArea').append('<p><span class="speakerName">'+_who+': </span>'+finalQuestion+'</p>'+inputBox);
			}
			else if(_currentSlide === 0) {
				var intro = _curNpc.dialog.question[0],
					inputBox = '<form><input></input></form>',
					content = $('.resourceStage .pages .page').get(0).innerHTML;

				$('.resourceArea').append('<p><span class="speakerName">'+_who+': </span>'+intro+'</p>'+content);
			}
			else if(_currentSlide > 0) {
				var content = $('.resourceStage .pages .page').get(_currentSlide).innerHTML;
				$('.resourceArea').append(content);
			}		
		}
		
		

	},

	showChat: function() {		
		var ran = Math.floor(Math.random() * _curNpc.dialog.random.length),
		speak = _curNpc.dialog.random[ran];
		
		$('.speechBubble').css('height',40);
		$('.speechBubble').append('<p><span class="speakerName">'+_who+': </span>'+speak+'</p>').slideDown(function() {
			$game.$npc.hideTimer = setTimeout($game.$npc.hideChat,5000);
		});
		
	},

	hideResource: function() {
		$('.resourceArea').slideUp(function() {
			$('.resourceArea p').remove();
			$('.resourceArea h2').remove();
			$game.$npc.isResource = false;
		});		
	},

	hideChat: function() {
		
		clearTimeout($game.$npc.hideTimer);
		$('.speechBubble').slideUp(function() {
			$('.speechBubble').empty();
			$game.$npc.isChat = false;
			$game.$npc.isResource = false;
			$(".speechBubble .btn-success").unbind("click");
			$(".speechBubble .btn-danger").unbind("click");
		});
	},

	//super ghetto hack to go back a page
	previousSlide: function() {
		_currentSlide -= 2;
		$game.$npc.nextSlide();
	},

	nextSlide: function() {
		
		_currentSlide += 1;

		//wipe the resource area
		$('.resourceArea').empty();

		$game.$npc.addContent();

		$game.$npc.addButtons();

		//add content (depending on what it is )
		
		
		
	},

	submitAnswer: function() {
		//if the answer is true, give them something!
		if(true) {
			_answered = true;
			$game.$npc.nextSlide();
		}
		else {

		}

		//otherwise tell them they are wrong, stay on form page 


	},

	setIndex: function(i) {
		_index = i;
	},

	animateFrame: function () {
		for(var i = 0; i < $game.onScreenNpcs.length; i += 1) {
			var curId = $game.onScreenNpcs[i];
			_allNpcs[curId].counter += 1;
			if(_allNpcs[curId].counter > 16) { 
				_allNpcs[curId].counter = 0;
			}

			if(_allNpcs[curId].counter % 8 === 0) {
				_allNpcs[curId].currentFrame += 1;
				if(_allNpcs[curId].currentFrame === 4) {
					_allNpcs[curId].currentFrame = 0;
				}
				var spot = _allNpcs[curId].currentFrame;
				data = {};
				data.srcX = _allNpcs[curId].spriteMap[spot].x,
				data.srcY = _allNpcs[curId].spriteMap[spot].y,
				data.x = _allNpcs[curId].id % $game.TOTAL_WIDTH,
				data.y = Math.floor(_allNpcs[curId].id / $game.TOTAL_WIDTH);

				$game.$renderer.renderNpc(data);
			}
			
		}
	},

	render: function(tile) {
		//get npc data based on tileStateVal to string
		var data = {};
			stringId = String(tile.tileState); 
		
		data.srcX = _allNpcs[stringId].spriteMap[0].x,
		data.srcY = _allNpcs[stringId].spriteMap[0].y,
		data.x = tile.x,
		data.y = tile.y;
		$game.$renderer.renderNpc(data);
	}

}
