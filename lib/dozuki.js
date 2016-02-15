(function (global) {
   global.Dozuki =
   function Dozuki(domain, http) {
      baseUrl = "https://" + domain +  "/api/2.0/";
      this.guides = {
         get: function(guideid) {
            return http.send(
               baseUrl + "guides/" + guideid,
               {
                  dataType:   'json',
                  method: 'get'
               });
         }
      };
      this.wikis = {
         get: function(namespace, title) {
            return http.send(
               baseUrl + "wikis/" + encodeURIComponent(namespace) + "/" + encodeURIComponent(title),
               {
                  dataType:   'json',
                  method: 'get'
               });
         }
      };
      this.suggest = {
         get: function(query, doctypes) {
            return http.send(
               baseUrl + "suggest/" + encodeURIComponent(query),
               {
                  dataType:   'json',
                  method: 'get',
                  data: {
                     // comma-separated string or array
                     doctypes: doctypes.join ? doctypes.join(',') : doctypes
                  }
               });
         }
      };
   }

   global.Dozuki.http = {};
})(typeof window != 'undefined' ? window : module.exports);
