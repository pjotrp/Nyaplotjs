define(function(require, exports, module){
    diagrams = {};

    diagrams.bar = require('view/diagrams/bar');
    diagrams.histogram = require('view/diagrams/histogram');
    diagrams.scatter = require('view/diagrams/scatter');
    diagrams.line = require('view/diagrams/line');
    diagrams.venn = require('view/diagrams/venn');
    diagrams.multiple_venn = require('view/diagrams/multiple_venn');

    return diagrams;
});
