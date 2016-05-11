module.exports = {
    add_ratings: function(ratings, new_list) {
        new_list.map(rl => ratings.push(rl));
    },

    sum : function (ratings) {
        return ratings.reduce(function (a, b) {
            return a + b;
        });
    },

    avg: function (ratings) {
        return this.sum(ratings) / ratings.length;
    },

    bean: function(list, low, high) {
        return list.filter(i => {
            return i > low && i <= high
        }).length;
    },

    beans: function(list, from, to, step) {
        var beans = [];
        for (var i = from; i < to; i = i + step) {
            beans.push(this.bean(list, i, i + step));
        }
        return beans;
    }
};
