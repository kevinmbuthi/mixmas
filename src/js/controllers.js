
// Main Controller
UI.controller('AppLaunch',['$scope', function ($scope, $timeout, $watch, $apply, data) {}]);

// Tracklist controller
UI.controller('trackListCtrl', ['$scope', function ($scope, data) {}]);

// Tabs controller
UI.controller('UITabs',['$scope', function ($scope, data) {
    this.index = 1;
    this.setView = (index) =>  { this.index  = index; }
    this.getView = (index) => { return(this.index); }
}]);
