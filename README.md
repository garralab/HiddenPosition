<div class="span12">
    <h1><a href="http://www.garralab.com/hiddenposition.php">jQuery HiddenPosition</a></h1> <i><a href="http://www.garralab.com/hiddenposition.php">live demo</a></i>
    <h3>Position any element to any element, even if they are hidden</h3>
    <p>
    This plugin works exactly (at least in our intentions) as <a href="http://jqueryui.com/demos/position/" title="external link"><i class="icon-share"></i>position plugin from jQuery UI</a>.
    The need for this plugin raised from the fact that it doesn't work with hidden elements, and in some cases we prefered to position them before showing.
    Since we still use jQuery UI where we don't need to position anything hidden or any of the additional options, this plugin is built so that it can use the exact same option input, this way you just need to change your code from <code class="language-js">$().position({options...});</code> to <code class="language-js">$().hiddenPosition({options...});</code>.
    The inverse is true unless you are using one of the few additional options, like viewport setting. Another big difference is that HiddenPosition works well even with <i>position:relative</i> elements, so take that into account if you need to go back to jQuery UI.
    </p>
</div>