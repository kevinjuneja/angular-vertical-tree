angular.module( 'drg.angularVerticalTree', [ 'ngSanitize' ] )
    .directive( 'verticalTree', ["$templateCache", "$timeout", function( $templateCache, $timeout ) {
        return {
            restrict : 'EA',
            scope : true,
            controller : 'vTreeCtrl',
            compile : function( elem, attrs ) {
                var breadcrumb = elem.find( 'vertical-tree-breadcrumb' ),
                    leaf = elem.find( 'vertical-tree-leaf'),
                    items = attrs.treeItems,
                    opts = attrs.treeOpts;

                breadcrumb = breadcrumb && breadcrumb.length > 0 ? breadcrumb.html() : '';
                leaf = leaf && leaf.length > 0 ? leaf.html() : '';

                elem.html( $templateCache.get( 'drg/angularVerticalTree.tpl.html' ) );

                return {
                    pre : function( scope ) {
                        scope.vTreeTemplates = {
                            breadcrumb : 'drg/vTreeBreadcrumb' + scope.$id + '.tpl.html',
                            leaf : 'drg/vTreeLeaf' + scope.$id + '.tpl.html'
                        };

                        scope.vTreeExpr = {
                            items : items || '[]',
                            opts : opts || '{}',
                            open : null,
                            select : null
                        };

                        // save the html to be used for the breadcrumbs and leaves as templates
                        $templateCache.put( scope.vTreeTemplates.breadcrumb, breadcrumb );
                        $templateCache.put( scope.vTreeTemplates.leaf, leaf );


                        scope.$watch( function() { return attrs.treeItems; }, function( itemExpr ) {
                            scope.vTreeExpr.items = itemExpr || '[]';
                        } );
                        scope.$watch( function() { return attrs.treeOpts; }, function( optsExpr ) {
                            scope.vTreeExpr.opts = optsExpr || '{}';
                        } );
                        scope.$watch( function() { return attrs.onOpen; }, function( open ) {
                            scope.vTreeExpr.open = open || null;
                        } );
                        scope.$watch( function() { return attrs.onSelect; }, function( select ) {
                            scope.vTreeExpr.select = select || null;
                        } );
                    },
                    post : function( scope, elem, attrs ) {
                        scope.vTreeCtrl.render = function() {
                            $timeout( function() {
                                var container = elem.children().eq( 0 ),
                                    breadcrumbs = container.children().eq( 0 ),
                                    branch = container.children().eq( 1 );

                                console.log( 'calc(100% - ' + breadcrumbs.height() + 'px)' );

                                branch.css( 'height', 'calc(100% - ' + breadcrumbs.height() + 'px)' );
                            } );
                        };


                    }
                }
            }
        };
    }] )
    .controller( 'vTreeCtrl', ["$scope", "$timeout", function( $scope, $timeout ) {

        var defaultOpts = {
            children : 'children',
            classes: {
                container: 'panel panel-default',
                breadcrumbs: 'panel-heading',
                breadcrumb: 'panel-title',
                branch: 'list-group',
                leaf: 'list-group-item'
            }
        };

        function onOpen( folder ) {
            $scope.vTreeCtrl.breadcrumbs.push( folder );
            $scope.vTreeCtrl.currentItems = folder[ $scope.vTreeCtrl.opts.children ];

            $scope.vTreeCtrl.render();

            $scope.$emit( 'verticalTree.openFolder', folder );

            if( $scope.vTreeExpr.open ) {
                $scope[ $scope.vTreeExpr.open ]( folder );
            }
        }

        function onSelect( item ) {
            $scope.$emit( 'verticalTree.selectItem', item );

            if( $scope.vTreeExpr.select ) {
                $scope[ $scope.vTreeExpr.select ]( item );
            }
        }

        $scope.vTreeCtrl = {
            get opts() {
                return angular.extend( angular.copy( defaultOpts ), $scope.$eval( $scope.vTreeExpr.opts ) || {} );
            },

            breadcrumbs : [],

            get items() {

                return $scope.$eval( $scope.vTreeExpr.items ) || [];
            },
            currentItems : [],

            leafClickHandler : function( item ) {
                var children = item[ $scope.vTreeCtrl.opts.children ];
                if( children && children.length > 0 ) {
                    onOpen( item );
                } else {
                    onSelect( item );
                }
            },
            breadcrumbClickHandler : function( item ) {
                for( var i = 0; i < $scope.vTreeCtrl.breadcrumbs.length; i++ ) {
                    if( angular.equals( $scope.vTreeCtrl.breadcrumbs[ i ], item ) ) {
                        $scope.vTreeCtrl.breadcrumbs.splice( i, $scope.vTreeCtrl.breadcrumbs.length - i );
                        onOpen( item );
                        break;
                    }
                }
            }
        };

        $timeout( function() {
            $scope.vTreeCtrl.currentItems = $scope.vTreeCtrl.items;
        } );

    }] );

angular.module("drg.angularVerticalTree").run(["$templateCache", function($templateCache) {$templateCache.put("drg/angularVerticalTree.tpl.html","<div class=\"v-tree-container\" ng-class=\"vTreeCtrl.opts.classes.container\">\n    <div class=\"v-tree-breadcrumbs\" ng-class=\"vTreeCtrl.opts.classes.breadcrumbs\">\n        <div class=\"v-tree-breadcrumb\" ng-class=\"vTreeCtrl.opts.classes.breadcrumb\" ng-repeat=\"breadcrumb in vTreeCtrl.breadcrumbs track by $index\">\n            <a href=\"javascript:;\" ng-click=\"vTreeCtrl.breadcrumbClickHandler(breadcrumb)\" ng-include=\"vTreeTemplates.breadcrumb\"></a>\n        </div>\n    </div>\n    <ul class=\"v-tree-branch\" ng-class=\"vTreeCtrl.opts.classes.branch\">\n        <li class=\"v-tree-leaf\" ng-class=\"vTreeCtrl.opts.classes.leaf\" ng-repeat=\"leaf in vTreeCtrl.currentItems\">\n            <a href=\"javascript:;\" ng-click=\"vTreeCtrl.leafClickHandler(leaf)\" ng-include=\"vTreeTemplates.leaf\"></a>\n        </li>\n    </ul>\n</div>\n");}]);