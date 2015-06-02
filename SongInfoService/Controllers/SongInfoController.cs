using SongInfoService.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace SongInfoService.Controllers
{
    public class SongInfoController : ApiController
    {
        //[EnableCors(origins: "*", headers: "*", methods: "*", SupportsCredentials = false)]
        public IEnumerable<SongInfo> Get()
        {
            string filePath = HttpContext.Current.Server.MapPath("~/AudioFiles");
            string[] songFiles = Directory.GetFiles(filePath);

            List<SongInfo> SongDetails = new List<SongInfo>();

            string baseUrl = HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority);

            foreach (string songPath in songFiles)
            {
                TagLib.File song = TagLib.File.Create(songPath);

                SongInfo info = new SongInfo();
                info.Album = song.Tag.Album;
                info.Artist = song.Tag.FirstPerformer;
                info.Comment = song.Tag.Comment;
                info.Genre = song.Tag.FirstGenre;
                info.Title = song.Tag.Title;
                info.Year = (int)song.Tag.Year;
                info.Duration = song.Properties.Duration.ToString(@"hh\:mm\:ss");

                info.URL = baseUrl + VirtualPathUtility.ToAbsolute("~/AudioFiles/" + Path.GetFileName(songPath));
                SongDetails.Add(info);
            }
            return SongDetails;
        }
    }
}
