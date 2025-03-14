using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using AccountingSoftwareApi.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ASDataManager.Library.DataAccess;
using ASDataManager.Library.Internal.DataAccess;
using AccountingSoftwareApi.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AccountingSoftwareApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("ASDatabase-Auth")));
            services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>();
            services.AddControllersWithViews();
            services.AddRazorPages();

            //MvcOptions.EnableEndPointRouting = false;

            services.Configure<IdentityOptions>(options =>
            {
                options.User.RequireUniqueEmail = true;
            });


            //App Services
            services.AddTransient<IInventoryData, InventoryData>();
            services.AddTransient<IInvoiceData, InvoiceData>();
            services.AddTransient<IProductData, ProductData>();
            services.AddTransient<IClientData, ClientData>();
            services.AddTransient<ISupplierData, SupplierData>();
            services.AddTransient<ISaleData, SaleData>();
            services.AddTransient<IUserData, UserData>();
            services.AddTransient<ISQLDataAccess, SQLDataAccess>();
            services.AddScoped<IIdentityService, IdentityService>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowMyOrigin",
                builder => builder.WithOrigins("http://localhost:44359", "http://localhost:4200")
                                        .WithMethods("PUT", "DELETE", "GET", "OPTIONS", "POST")
                                        .AllowAnyHeader()
                                        .AllowCredentials()
                                        );

            });

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration.GetValue<string>("Secrets:SecurityKey"))),
                ValidateIssuer = false,
                ValidateAudience = false,
                RequireExpirationTime = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            services.AddSingleton(tokenValidationParameters);


            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "JwtBearer";
                options.DefaultChallengeScheme = "JwtBearer";
            })
                .AddJwtBearer("JwtBearer", jwtBearerOptions =>
                {
                    jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration.GetValue<string>("Secrets:SecurityKey"))),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        RequireExpirationTime = false,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                    #region unused code delete later
                    /*
                    jwtBearerOptions.Events = new JwtBearerEvents()
                    {
                        OnAuthenticationFailed = c =>
                        {
                            c.NoResult();
                            c.Response.StatusCode = 401;
                            c.Response.ContentType = "text/plain";
                            c.Response(c.Exception.ToString()).Wait();
                            return Task.CompletedTask;
                        },
                        OnChallenge = c =>
                        {
                            c.HandleResponse();
                            return Task.CompletedTask;
                        }
                    };
                    */


                    /*
                    jwtBearerOptions.Authority = "http://localhost:44359/";
                    jwtBearerOptions.RequireHttpsMetadata = false;
                    jwtBearerOptions.Audience = "resource_server";
                    jwtBearerOptions.Events = new JwtBearerEvents();
                    jwtBearerOptions.Events.OnChallenge = c =>
                  {
                      c.HandleResponse();

                      var payload = new JObject
                      {
                          ["error"] = c.Error,
                          ["error_description"] = c.ErrorDescription,
                          ["error_uri"] = c.ErrorUri
                      };

                      c.Response.ContentType = "application/json";
                      c.Response.StatusCode = 401;

                      return c.Response.StartAsync();
                  };
                  */
                    #endregion
                });

            services.AddSwaggerGen(setup =>
            {
                //setup.SwaggerDoc(
                //    "v1", new OpenApiInfo
                //    {
                //        Title = "Accounting Software API",
                //        Version = "v1"
                //    });
                //setup.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
                //setup.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                //{
                //    Name = "Authorization",
                //    Type = SecuritySchemeType.Http,
                //    Scheme = "Bearer",
                //    BearerFormat = "JWT",
                //    In = ParameterLocation.Header,
                //    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
                //});
                //setup.AddSecurityRequirement(new OpenApiSecurityRequirement
                // {
                //     {
                //        new OpenApiSecurityScheme
                //        {
                //             Reference = new OpenApiReference
                //             {
                //                 Type = ReferenceType.SecurityScheme,
                //                 Id = "Bearer"
                //             },
                //             Scheme = "oauth2",
                //              Name = "Bearer",
                //              In = ParameterLocation.Header,
                //        },
                //            new string[] {}
                //     }
                //});
                var jwtSecurityScheme = new OpenApiSecurityScheme
                {
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Name = "JWT Authentication",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Description = "Put **_ONLY_** your JWT Bearer token on textbox below!",

                    Reference = new OpenApiReference
                    {
                        Id = JwtBearerDefaults.AuthenticationScheme,
                        Type = ReferenceType.SecurityScheme
                    }
                };

                setup.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);

                setup.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    { jwtSecurityScheme, Array.Empty<string>() }
                });
            });



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }




            app.UseStaticFiles();

            app.UseRouting();

            app.UseCors("AllowMyOrigin");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseDeveloperExceptionPage();

            app.UseHttpsRedirection();

            app.UseSwagger();
            app.UseSwaggerUI(x =>
            {
                //x.SwaggerEndpoint("/swagger/v1/swagger.json", "AccountingSoftwareAPI V1");
                x.SwaggerEndpoint("v1/swagger.json", "AccountingSoftwareAPI V1");
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });
            app.UseDeveloperExceptionPage();

        }
    }
}
