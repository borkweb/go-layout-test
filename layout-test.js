var gigaom_layout_test = {};
(function( $ ) {
	'use strict';

	gigaom_layout_test.init = function() {
		this.$body = $( '.post section.body.entry-content' );
		this.$content = this.$body.find( '> div' );
		this.$alignleft = this.$content.find( '.alignleft' );
		this.$alignright = this.$content.find( '.alignright' );

		this.$body.css( 'overflow', 'visible' );
		this.$content.css( 'position', 'relative' );
		this.$alignleft.css( 'margin-left', '-150px' );
		this.$alignright.css( 'margin-right', '-150px' );

		this.insert = {};
		this.insert.ad1 = {
			name: 'Ad 1',
			$el: $( '<div id="ad1" class="layout-box-insert layout-box-insert-right" style="height:266px;"><div>Ad #1</div></div>' ),
			height: 250 // set to the required height, not the actual height
		};
		this.insert.ad_tower = {
			name: 'Ad Tower',
			$el: $( '<div id="ad-tower" class="layout-box-insert layout-box-insert-right tall" style="height:616px;"><div>Tower Ad</div></div>' ),
			height: 525 // set to the required height, not the actual height
		};
		this.insert.ad2 = {
			name: 'Ad 2',
			$el: $( '<div id="ad2" class="layout-box-insert layout-box-insert-right" style="height:266px;"><div>Ad #2</div></div>' ),
			height: 250, // set to the required height, not the actual height
			preferbottom: true
		};
		this.insert.related1 = {
			name: 'Auto 3',
			$el: $( '<div id="auto3" class="layout-box-insert layout-box-insert-left" style="height:375px;background:blue;"><div>Auto 3</div></div>' ),
			height: 325, // set to the required height, not the actual height
		};
		this.insert.related2 = {
			name: 'Auto E',
			$el: $( '<div id="autoe" class="layout-box-insert layout-box-insert-left" style="height:325px;background:blue;"><div>Auto E</div></div>' ),
			height: 270, // set to the required height, not the actual height
		};
		this.insert.newsletter = {
			name: 'Newsletter Subscription',
			$el: $( '<div id="newsletter-sub" class="layout-box-insert layout-box-insert-left" style="height:280px;background:blue;"><div>Newsletter Subscription</div></div>' ),
			height: 250, // set to the required height, not the actual height
		};

		this.inventory = {
			p: [],
			blackouts: [],
			gaps: []
		};

		this.css = '<style class="layout-box-css">' +
			'.layout-box-thing {' +
				'position: absolute;' +
				'width: 100%;' +
			'}' +
			'.layout-box-thing div {' +
				'bottom: 0;' +
				'color: white;' +
				'font-size: 1.5rem;' +
				'max-height: 3em;' +
				'left: 0;' +
				'line-height: 1.5em;' +
				'margin: auto;' +
				'position: absolute;' +
				'right: 0;' +
				'text-align: center;' +
				'top: 0;' +
			'}' +
			 '.layout-box-insert div {' +
			 	'text-align: center;' +
			 	'margin-top: 1em;' +
			 	'font-size: 1.5em;' +
			 	'color: white' +
			 '}' +
			'.layout-box-insert {' +
				'background: red;' +
				'margin-bottom: 1rem;' +
				'width:300px;' +
			'}' +
			'.layout-box-insert.layout-box-insert-right {' +
				'float: right;' +
				'margin-left: .5rem;' +
				'margin-right: -150px;' +
			'}' +
			'.layout-box-insert.layout-box-insert-left {' +
				'float: left;' +
				'margin-left: -150px;' +
				'margin-right: .5rem;' +
			'}' +
			'.inject-point {' +
				'background: green;' +
			'}' +
		'</style>';

		$( '.layout-box-thing, .layout-box-css, .layout-box-insert' ).remove();
		this.$content.before( this.css );
		this.calc();

		console.info( 'injecting items' );
		for ( var key in this.insert ) {
			this.inject_item( this.insert[ key ] );
			this.calc();
		}
	};

	gigaom_layout_test.attributes = function( $el ) {
		var margin_top = $el.css( 'margin-top' );
		var margin_bottom = $el.css( 'margin-bottom' );

		margin_top = parseInt( margin_top.replace( 'px', '' ), 10 );
		margin_bottom = parseInt( margin_bottom.replace( 'px', '' ), 10 );

		var top = parseInt( $el.position().top, 10 );
		var height = parseInt( $el.outerHeight( true ), 10 );
		top -= margin_top;
		var end = top + height;

		var data = {
			$el: $el,
			start: top,
			end: end,
			height: height,
			margin_top: margin_top,
			margin_bottom: margin_bottom
		};

		return data;
	};

	gigaom_layout_test.sort_by_start = function( a, b ) {
		var a_start = a.start;
		var b_start = b.start;
		return ( ( a_start < b_start ) ? -1 : ( ( a_start > b_start ) ? 1 : 0 ) );
	};

	gigaom_layout_test.overlay = function( $el, start, height, color, type, additional_text ) {
		additional_text = typeof additional_text !== 'undefined' ? '<br/>' + additional_text : '';

		var $overlay = $( '<div class="layout-box-thing ' + type + '" style="background: ' + color + ';top:' + start + 'px;height:' + height + 'px;"><div>' + height + 'px tall' + additional_text + '</div></div>' );
		if ( 'gap' === type ) {
			$el.before( $overlay );
		}//end if
		else if( 'solo-gap' === type ) {
			$el.append( $overlay );
		}//end if
		else {
			$el.after( $overlay );
		}// end else

		return $overlay;
	};

	gigaom_layout_test.reset = function() {
		$( '.layout-box-thing' ).remove();
		this.inventory = {
			p: [],
			blackouts: [],
			gaps: [],
			spaces: []
		};
		$( '.inject-point' ).removeClass( 'inject-point' );
	};

	gigaom_layout_test.calc = function() {
		this.reset();

		// find things (not sure what we are using this for)
		this.$content.find( '> p, > ol, > ul' ).each( function() {
			var $el = $( this );
			var attr = gigaom_layout_test.attributes( $el );
			gigaom_layout_test.inventory.p.push( attr );
		});

		this.identify_blackouts();

		this.identify_gaps();
	};

	gigaom_layout_test.identify_blackouts = function() {
		// find top level blackouts
		this.$content.find( '> *:visible:not(p):not(ol):not(ul):not(script)' ).each( function() {
			var $el = $( this );
			var attr = gigaom_layout_test.attributes( $el );
			attr.is_child = false;
			gigaom_layout_test.inventory.blackouts.push( attr );
		});

		// find child blackouts
		this.$content.find( '> p *' ).each( function() {
			var $el = $( this );
			if ( ! $el.is( 'img' ) && ! $el.is( 'iframe' ) && ! $el.is( '.layout-box-insert' ) ) {
				return;
			}//end if

			var attr = gigaom_layout_test.attributes( $el );
			attr.is_child = true;
			gigaom_layout_test.inventory.blackouts.push( attr );
		});

		// draw the blackout overlays
		for ( var i in this.inventory.blackouts ) {
			var blackout = this.inventory.blackouts[ i ];
			blackout.ref = gigaom_layout_test.get_element_type( blackout.$el );
			if ( blackout.is_child ) {
				blackout.$overlay = this.overlay( blackout.$el.closest( 'p' ), blackout.start, blackout.height, 'rgba( 0, 0, 0, 0.5 )', 'blackout', blackout.ref );
			}// end if
			else {
				blackout.$overlay = this.overlay( blackout.$el, blackout.start, blackout.height, 'rgba( 0, 0, 0, 0.5 )', 'blackout', blackout.ref );
			}// end else
		}//end for

		this.inventory.blackouts.sort( this.sort_by_start );
	};

	gigaom_layout_test.identify_gaps = function() {
		var start = 0;

		if ( 0 === this.inventory.blackouts.length ) {
			var $overlay = this.overlay( this.$content, start, this.$content.outerHeight(), 'rgba( 0, 255, 0, 0.5 )', 'solo-gap' );
			var gap = this.attributes( $overlay );
			gap.$overlay = $overlay;
			gap.$first_el = this.$content.find( ':first' );

			this.inventory.gaps.push( gap );
		}//end if
		else {
			var previous_blackout = null;
			for ( var i in this.inventory.blackouts ) {
				var blackout = this.inventory.blackouts[ i ];

				if ( blackout.start > start ) {
					var gap_height = blackout.start - start;
					if ( 0 == gap_height ) {
						continue;
					}//end if

					var $overlay = this.overlay( blackout.$overlay, start, gap_height, 'rgba( 0, 255, 0, 0.5 )', 'gap' );
					var gap = this.attributes( $overlay );
					gap.$overlay = $overlay;

					if ( 0 === start ) {
						gap.$first_el = this.$content.find( ':first' );
					}//end if
					else {
						var tmp = this.attributes( previous_blackout.$overlay.next() );

						// find an element below the blackout
						while ( tmp.start < previous_blackout.end ) {
							tmp = this.attributes( tmp.$el.next() );
						}// end while

						if ( tmp.start >= previous_blackout.end && tmp.end <= blackout.start ) {
							gap.$first_el = tmp.$el;
						}//end if
						else {
							// console.info( "failed to find an injection point - " + gap.height );
							// console.log( tmp.start + " > " + previous_blackout.end + " && " + tmp.end + " < " + blackout.start );
						}
					}//end else

					if ( gap.$first_el ) {
						this.inventory.gaps.push( gap );
					}//end if
					else {
						// should we hide the gap overlay if there is no injection point?
						this.inventory.spaces.push( gap );
					}
				}//end if

				start = blackout.end;
				previous_blackout = blackout;
			}//end for

			if ( previous_blackout.end < this.$content.outerHeight() ) {
				// find the last gap below the final blackout
				var $overlay = this.overlay( previous_blackout.$overlay, start, ( this.$content.outerHeight() - start ), 'rgba( 0, 255, 0, 0.5 )', 'last-gap' );
				var gap = this.attributes( $overlay );
				gap.$overlay = $overlay;
				gap.$first_el = gap.$overlay.next();

				// check that the element we found is below the blackout
				// @note: slight fear that this could cause an infinite loop
				while ( gap.$first_el && gap.$first_el.position() && gap.$first_el.position().top < previous_blackout.end ) {
					gap.$first_el = gap.$first_el.next();
				}// end while

				// make sure the gap has an element in it, if not, it can't be counted
				if ( gap.$first_el && gap.$first_el.position() ) {
					this.inventory.gaps.push( gap );
				}//end if
				else {
					// should we hide gaps with no injection point?
					//gap.$overlay.remove();
				}
			}//end if

			// execute common code on gaps
			for ( var i in this.inventory.gaps ) {
				var gap = this.inventory.gaps[ i ];

				gap.$first_el.addClass( 'inject-point' );
			}
		}//end else
	};

	gigaom_layout_test.inject_item = function( item ) {
		var $element = null;

		for ( var i in this.inventory.gaps ) {
			var gap = this.inventory.gaps[ i ];
			if ( gap.height > item.height ) {
				$element = gap.$first_el;

				if ( item.preferbottom ) {
					// find the last element in the gap where item will fit
					var next_element = this.attributes( $element );
					while ( next_element.end <= gap.end && ( gap.end - next_element.start ) > item.height ) {
						//console.info( next_element.end + "<=" + gap.end + " && ( " + gap.end + " - " + next_element.start + " ) > " + item.height );
						$element = next_element.$el;
						next_element = this.attributes( $element.next() );
					}// end while
				}//end if
				else {
					break;
				}//end else
			}//end if
		}//end for

		if ( ! $element ) {
			//console.info( 'Failed to inject ' + item.name );
			return false;
		}// end if

		//console.info( 'successfully injected ' + item.name + ' into a ' + $element[0].outerHTML );

		return $element.prepend( item.$el );
	};

	gigaom_layout_test.get_tag_ref = function( $el ) {
		var ref = $el.prop( "tagName" ).toLowerCase();

		var id = $el.attr( 'id' );
		if ( id ) {
			ref += '#' + id;
		}//end if

		var classes = $el.attr( 'class' );
		if ( classes ) {
			ref += '.' + classes.replace(/ /g, '.' );
		}//end if

		return ref;
	};

	gigaom_layout_test.get_element_type = function( $el ) {
		if ( $el.is( '.pullquote' ) ) {
			return 'pullquote';
		}//end if

		var id = $el.attr( 'id' );

		if ( id && id.match( /attachment_/g ) ) {
			var alignment = '';
			if ( $el.is( '.aligncenter' ) ) {
				alignment = 'centered';
			}//end if
			else if ( $el.is( '.alignleft' ) ) {
				alignment = 'left';
			}//end else if
			else if ( $el.is( '.alignright' ) ) {
				alignment = 'right';
			}//end else if
			return 'attachment ' + alignment;
		}//end if

		if ( $el.is( '.layout-box-insert' ) ) {
			return id;
		}//end if

		var tagname = $el.prop( "tagName" ).toLowerCase();
		if ( tagname.match( /^h[0-9]$/ ) ) {
			return 'heading';
		}//end if

		if ( 'iframe' === tagname ) {
			return 'iframe';
		}//end if
		if ( 'blockquote' === tagname ) {
			return 'blockquote';
		}//end if
		if ( 'img' === tagname ) {
			var alignment = '';
			if ( $el.is( '.aligncenter' ) ) {
				alignment = 'centered';
			}//end if
			else if ( $el.is( '.alignleft' ) ) {
				alignment = 'left';
			}//end else if
			else if ( $el.is( '.alignright' ) ) {
				alignment = 'right';
			}//end else if

			return 'image ' + alignment;
		}//end if

		var classes = '.' + $el.prop( "class" ).replace(/ /g, '.' );
		if ( classes.match( /\.embed-/g ) ) {
			return 'embed';
		}//end if

		return gigaom_layout_test.get_tag_ref( $el );
	};

})( jQuery );
