<%@ WebHandler Language="C#" Class="UploadFile" %>

using System;
using System.Web;

public class UploadFile : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        //context.Request.SaveAs("request.log", true);
        context.Response.ContentType = "application/json";
        context.Response.Write("{\"Error\":\"\",\"Data\":\"\"}");
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}