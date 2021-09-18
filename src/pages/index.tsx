import { useState } from 'react';
import Link from 'next/link'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from "react-icons/fi";
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [postsList, setPostsLists] = useState<PostPagination>(postsPagination)

  const fetchPosts = async () => {
    const response = await fetch(postsList.next_page)
    const data: PostPagination = await response.json()
    return setPostsLists({
      next_page: data.next_page,
      results: [...postsList.results, ...data.results]
    })
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {postsList.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div className={styles.postCardFooter}>
                  <div className={styles.postCardFooterContent}>
                    <FiCalendar />
                    <time>{format(parseISO(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>
                  </div>
                  <div className={styles.postCardFooterContent}>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {postsList.next_page && (
            <button
              className={styles.morePosts}
              type='button'
              onClick={() => fetchPosts()}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content', 'post.subtitle', 'post.author'],
    pageSize: 1
  });

 const postsPagination = postsResponse.results.map(post => {

    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsPagination
      },
      revalidate: 60 * 30
    }
  }
};
