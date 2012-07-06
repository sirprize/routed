var profile = (function(){
    var copyOnly = function(filename, mid){
        var list = {
            "sirprize/spirr/sirprize.spirr.profile": 1,
            "sirprize/spirr/package.json": 1
        };
        return (mid in list);
    };

    return {
        resourceTags: {
            test: function (filename, mid) {
                return false;
            },

            copyOnly: function (filename, mid) {
                return copyOnly(filename, mid);
            },

            amd: function (filename, mid) {
                return !copyOnly(filename, mid) && /\.js$/.test(filename);
            }
        }
    };
})();