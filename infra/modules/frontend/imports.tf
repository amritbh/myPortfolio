import {
  to = aws_route53_zone.main
  id = "Z005277622XOKOCOMUSV2"
}

import {
  to = aws_s3_bucket.frontend_bucket
  id = "amrit.cloud"
}

import {
  to = aws_cloudfront_origin_access_control.default
  id = "E1NWVKWK4KTVFK"
}

import {
  to = aws_cloudfront_distribution.cdn
  id = "E16Z465ZCRUYRV"
}

import {
  to = aws_acm_certificate.cert
  id = "arn:aws:acm:us-east-1:767397976993:certificate/f327e882-69b0-44d8-8bff-237b29b39855"
}

import {
  to = aws_s3_bucket_public_access_block.frontend_bucket_pab
  id = "amrit.cloud"
}
