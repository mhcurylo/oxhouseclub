#!/usr/bin/env stack
-- stack --resolver lts-16.6 --install-ghc runghc --package blaze --package markdown --package text --package directory

{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE BlockArguments #-}
{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE RankNTypes #-}

import Prelude hiding (head, div, id, span)
import qualified Prelude
import Text.Blaze.Html.Renderer.Text
import Text.Blaze.Html5 ((!), script, h1, p, canvas, toHtml, docTypeHtml, head, meta, span, link, title, body, div, button, a, ul, li, lazyTextValue)
import Text.Blaze.Html5.Attributes (href, src, lang, charset, name, content, rel, class_, type_, media, style, id)
import qualified Text.Blaze.Internal as B
import Text.Markdown
import Text.Markdown.Block
import Text.Markdown.Inline
import qualified Data.Text.Lazy.IO as T
import qualified Data.Text.Lazy as T
import qualified Data.Text as NL
import System.Directory (listDirectory)
import Control.Monad (forM_, mapM)

main = do
  postFiles <- map ("posts/" <>) <$> listDirectory "posts"
  posts <- mapM T.readFile $ (postFiles <> ["./about.markdown"])
  T.writeFile "index.html"  . spanParagraphs . renderHtml $ fromMarkdownBlog posts

fromMarkdownBlog posts = docTypeHtml ! lang "en" $ do
  let postTitles = map (Prelude.head . T.lines) posts
  head $ do
    meta ! charset "utf-8"
    title "αβγ"
    meta ! name "description" ! content "Ox House Club"
    meta ! name "author" ! content "Mateusz Curylo"
    meta ! name "viewport" ! content "width=device-width, initial-scale=1"
    link ! href "css/style.css" ! rel "stylesheet" ! media "screen"
    link ! href "css/normalize.css" ! rel "stylesheet" ! media "screen"
    link ! href "favicon.ico" ! rel "icon" ! type_ "image/ico"
  body $ do
    canvas ! id "bckg" $ ""
    forM_ posts $ \post -> do
      let postTitle = (Prelude.head . T.lines) post
      div ! class_ "post_container" ! id (lazyTextValue postTitle) $ do
        div ! class_ "post_sidemenu" $ ul $ forM_ postTitles \pt -> do
          li ! class_ ("post_sidemenu_item" <> 
                        if pt == postTitle then " post_sidemenu_target" else "") 
            $ a ! href (lazyTextValue $ "#" <> pt) $ toHtml pt
        div ! class_ "post_content" $ markdown def post
    script ! src "bckg.js" $ ""
   

spanParagraphs = T.replace "<h2>" "<h2><span>" . T.replace "</h2>" "</span></h2>"
               . T.replace "<p>" "<p><span>" . T.replace "</p>" "</span></p>"
