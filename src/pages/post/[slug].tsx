import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiUser, FiClock} from "react-icons/fi";

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: any
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      {post.data.banner && (
        <div className={styles.bannerContainer}>
          <img src={post.data.banner.url} alt='banner image'></img>
        </div>
      )}

      <main className={styles.container}>
        <h1>{post.data?.title}</h1>
        <div className={styles.info}>
          {post.first_publication_date && (
            <div className={styles.infoBlocks}>
              <FiCalendar />
              <time>{format(parseISO(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>
            </div>
          )}
          <div className={styles.infoBlocks}>
            <FiUser />
            <span>{post.data?.author}</span>
          </div>
          <div className={styles.infoBlocks}>
            <FiClock />
            <span>4 min</span>
          </div>
        </div>
        {post.last_publication_date && (
          <span className={styles.editInfo}>
            <i>
              * editado em
              <time> {format(parseISO(post.last_publication_date), "dd MMM yyyy', às 'kk:mm ", { locale: ptBR })}</time>
            </i>
          </span>
        )}

        <div className={styles.content}>
          {post.data?.content.map((content, index) => (
            <div className={styles.contentBlock} key={index}>
              <h2 className={styles.contentHeading}>{content.heading}</h2>
              <div
                className={styles.contentBody}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
              >
              </div>
            </div>
          ))}
        </div>
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={styles.exitButton}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.banner', 'post.author', 'post.content']
  });

  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), { ref: previewData?.ref ?? null });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post,
      preview
    },
    revalidate: 60 * 30
  }
};
